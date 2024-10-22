import {DigitalWallet} from "./digital_wallet";
import {createId, generateKeys, hashPassword} from "./key_utils";
import {encrypt} from "./cipher_utils";

export class Node{
    private _neighbors: { port: number, isAlive: boolean }[] = [];
    private _password: string = "";
    private _digitalWallet: DigitalWallet = new DigitalWallet();

    addNeighbor(port: number): void {
        this._neighbors.push({ port, isAlive: true });
    }

    removeNeighbor(port: number): void {
        this._neighbors = this._neighbors.filter(neighbor => neighbor.port !== port);
    }

    getNeighbors(): { port: number, isAlive: boolean }[] {
        return this._neighbors;
    }

    setPassword(password: string): void {
        this._password = password;
    }

    getPassword(): string {
        return this._password;
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

    async saveToFile(portNumber:number): Promise<void> {
        const fs = require('fs');
        var dir = './data';
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

}