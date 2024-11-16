import {DigitalWallet} from "./digital_wallet";
import {createId, generateKeys, hashPassword, encrypt, decrypt } from "./crypto_utils";
import {Block} from "./block";

export class Node{
    private _neighbors: { port: number, isAlive: boolean }[] = [];
    private _password: string = "";
    private _digitalWallet: DigitalWallet = new DigitalWallet();
    private _broadcastedMessages: { timestamp: Date, message: string, messageHash: string, messageType: string}[] = [];
    private _blocks: Block[] = [];

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

    addMessage(message: string, messageHash: string, timestamp: Date, messageType: string): void {
        this._broadcastedMessages.push({ timestamp, message, messageHash, messageType });
    }

    get getBroadcastedMessages(): { timestamp: Date, message: string, messageHash: string}[] {
        return this._broadcastedMessages;
    }

    addBlock(block: Block): void {
        this._blocks.push(block);
    }

    get getBlocks(): Block[] {
        return this._blocks;
    }

    async assignNeighborBlockchainToNode(port: number) {
        const response = await fetch(`http://localhost:${port}/get-blocks`);
        if (!response.ok) {
            throw new Error(`Failed to get blocks from port ${port}: ${response.statusText}`);
        }
        console.log('port: ' + port);

        const responseJson = await response.json();
        console.log(responseJson);
        this.addBlockchainFromJson(responseJson);
    }

    addBlockchainFromJson(responseJson: any): void {
        console.log(responseJson);
        responseJson.forEach((block: any) => {
            console.log(block);
            this.addBlock(Block.fromJson(block));
        });
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

    doesNodeAlreadyHasMessage(messageHash: string): boolean {
        for (let i = 0; i < this._broadcastedMessages.length; i++) {
            if(this._broadcastedMessages[i].messageHash == messageHash)
            {
                return true;
            }
        }
        return false;
    }

}