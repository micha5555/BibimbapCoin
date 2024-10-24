import {DigitalWallet} from "./digital_wallet";
import {createId, generateKeys, hashPassword, encrypt, decrypt } from "./crypto_utils";

export class Node{
    private _neighbors: { port: number, isAlive: boolean }[] = [];
    private _password: string = "";
    private _digitalWallet: DigitalWallet = new DigitalWallet();

    addNeighbor(port: number): void {
        if(this.getNeighbor(port) === undefined)
        {
            this._neighbors.push({ port, isAlive: true });
        }
    }

    setNeighborStatus(port: number, isAlive: boolean): void {
        let neighbor = this.getNeighbor(port);
        if(neighbor !== undefined)
        {
            neighbor.isAlive = isAlive;
        }
    }

    removeNeighbor(port: number): void {
        this._neighbors = this._neighbors.filter(neighbor => neighbor.port !== port);
    }

    getNeighbors(): { port: number, isAlive: boolean }[] {
        return this._neighbors;
    }

    getNeighbor(port: number): { port: number, isAlive: boolean } | undefined {
        return this._neighbors.find(neighbor => neighbor.port === port);
    }

    setPassword(password: string): void {
        this._password = password;
    }

    addIdentity(): void {
        let { privateKey, publicKey } = generateKeys();
        let id = createId(privateKey, publicKey);
        this._digitalWallet.addIdentity(privateKey, publicKey, id);
    }

    get getDigitalWallet(): DigitalWallet {
        return this._digitalWallet;
    }

    async parseToJsonObject(): Promise<any> {
        let encryptedDigitalWalletIdentities = this._digitalWallet.identities.map(identity => {
            return {
                privateKey: encrypt(identity.privateKey, this._password),
                publicKey: identity.publicKey,
                id: identity.id
            }
        });

        const promiseHashedUserPassword = hashPassword(this._password);
        const hashedPassword = await promiseHashedUserPassword.then((value) => {
            return value
        });

        return JSON.stringify({
            password: hashedPassword,
            digitalWallet: encryptedDigitalWalletIdentities
        })
    }

    async saveNodeToFile(portNumber:number): Promise<void> {
        const fs = require('fs');
        let dir = './data';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        if(!fs.existsSync(dir + '/' + portNumber)){
            fs.mkdirSync(dir + '/' + portNumber);
        }
        let fileName = dir + "/" + portNumber + "/node_data.json";

        const promiseParsedJSON = this.parseToJsonObject();
        const parsedJSON = await promiseParsedJSON.then((value) => {return value});
        fs.writeFileSync(fileName, parsedJSON);
    }

    async loadDigitalWalletFromFile(portNumber: number): Promise<void> {
        const fs = require('fs');
        let fileName = './data/' + portNumber + '/node_data.json';
        let data = fs.readFileSync(fileName);
        let dataJSON = JSON.parse(data);
        let decryptedDigitalWalletIdentities = dataJSON.digitalWallet.map((identity: { privateKey: string, publicKey: string, id: string }) => {
            return {
                privateKey: decrypt(identity.privateKey, this._password),
                publicKey: identity.publicKey,
                id: identity.id
            }
        });
        this._digitalWallet = new DigitalWallet();
        decryptedDigitalWalletIdentities.forEach((identity: { privateKey: string, publicKey: string, id: string }) => {
            this._digitalWallet.addIdentity(identity.privateKey, identity.publicKey, identity.id);
        });
    }

}