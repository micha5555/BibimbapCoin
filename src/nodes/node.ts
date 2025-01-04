//import {DigitalWallet} from "./digital_wallet";
//import { generateKeys, hashPassword, encrypt, decrypt } from "./crypto_utils";
import {blockchain, listToMine} from "../index";
// import {DigitalWallet} from "../wallet/digital_wallet";
// import { generateKeys, hashPassword, encrypt, decrypt } from "../crypto_utils";
import {Block} from "../block";
import {Message} from "../message";
import {Transaction} from "../transactions/transaction";
import {TransactionContainer} from "../transactions/transaction_container";

export abstract class Node{
    private _neighbors: { port: number, isAlive: boolean }[] = [];
    // private _password: string = "";
    // private _digitalWallet: DigitalWallet = new DigitalWallet();
    // private _identities: {identity: string}[] = [];
    private _broadcastedMessages: { timestamp: Date, message: string, messageHash: string, messageType: string}[] = [];
    protected port!: number

    setPort(port: number): void {
        this.port = port;
    }

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

    // setPassword(password: string): void {
    //     this._password = password;
    // }

    // tu zapytanie api
    // addIdentity(): void {
    //     // let { privateKey, publicKey } = generateKeys();
    //     // this._digitalWallet.addIdentity(this.port, privateKey, publicKey);
    // }

    addMessage(message: string, messageHash: string, timestamp: Date, messageType: string): void {
        this._broadcastedMessages.push({ timestamp, message, messageHash, messageType });
    }

    get getBroadcastedMessages(): { timestamp: Date, message: string, messageHash: string}[] {
        return this._broadcastedMessages;
    }

    async assignNeighborBlockchainToNode(port: number) {
        const response = await fetch(`http://localhost:${port}/get-blocks`);
        if (!response.ok) {
            throw new Error(`Failed to get blocks from port ${port}: ${response.statusText}`);
        }

        const responseJson = await response.json();
        this.addBlockchainFromJson(responseJson);
    }

    async assignNeighbourListToMineToNode(port: number) {
        const response = await fetch(`http://localhost:${port}/get-items-to-mine`);
        if (!response.ok) {
            throw new Error(`Failed to get items to mine from port ${port}: ${response.statusText}`);
        }

        const responseJson = await response.json();
        this.addListToMineFromJson(responseJson);
    }

    addBlockchainFromJson(responseJson: any): void {
        let blocks: Block[] = [];
        for (let blockJson of responseJson) {
            blocks.push(Block.fromJson(blockJson));
        }
        blockchain.addBatchOfBlocks(blocks);
    }

    addListToMineFromJson(responseJson: any): void {
        for (let item of responseJson) {
            listToMine.addTransactionToQueue(Transaction.recreateTransactionJson(JSON.stringify(item)));
        }
    }

    // get getIdentities(): {publicKey: string}[] {
    //     return this._identities;
    // }

    // get getDigitalWallet(): DigitalWallet {
    //     return this._digitalWallet;
    // }

    // async parseToJsonObject(): Promise<any> {
        // let encryptedDigitalWalletIdentities = this._digitalWallet.identities.map(identity => {
        //     return {
        //         privateKey: encrypt(identity.privateKey, this._password),
        //         publicKey: identity.publicKey
        //     }
        // });
        //
        // const promiseHashedUserPassword = hashPassword(this._password);
        // const hashedPassword = await promiseHashedUserPassword.then((value) => {
        //     return value
        // });
        //
        // return JSON.stringify({
        //     password: hashedPassword,
        //     digitalWallet: encryptedDigitalWalletIdentities
        // })
    // }

    // async saveNodeToFile(portNumber:number): Promise<void> {
    //     const fs = require('fs');
    //     let dir = './data';
    //     if (!fs.existsSync(dir)){
    //         fs.mkdirSync(dir);
    //     }
    //     if(!fs.existsSync(dir + '/' + portNumber)){
    //         fs.mkdirSync(dir + '/' + portNumber);
    //     }
    //     let fileName = dir + "/" + portNumber + "/wallet_data.json";
    //
    //     const promiseParsedJSON = this.parseToJsonObject();
    //     const parsedJSON = await promiseParsedJSON.then((value) => {return value});
    //     fs.writeFileSync(fileName, parsedJSON);
    // }
    //
    // async loadDigitalWalletFromFile(portNumber: number): Promise<void> {
    //     const fs = require('fs');
    //     let fileName = './data/' + portNumber + '/wallet_data.json';
    //     let data = fs.readFileSync(fileName);
    //     let dataJSON = JSON.parse(data);
    //     let digitalIdentities = dataJSON.digitalWallet.map((identity: { privateKey: string, publicKey: string }) => {
    //         return {
    //             privateKey: identity.privateKey,
    //             publicKey: identity.publicKey
    //         }
    //     });
    //     this._digitalWallet = new DigitalWallet();
    //     digitalIdentities.forEach((identity: { privateKey: string, publicKey: string }) => {
    //         this._digitalWallet.addIdentity(identity.privateKey, identity.publicKey);
    //     });
    // }

    doesNodeAlreadyHasMessage(messageHash: string): boolean {
        for (let i = 0; i < this._broadcastedMessages.length; i++) {
            if(this._broadcastedMessages[i].messageHash == messageHash)
            {
                return true;
            }
        }
        return false;
    }

    broadcastMessage(message: Message): void {
        this.addMessage(message.message, message.getMessageHash(), message.timestamp, message.messageType);
        this.getNeighbors().forEach(neighbor => {
            let result = fetch(`http://localhost:`+ neighbor.port + '/broadcast-message', {
                method: 'POST',
                body: JSON.stringify(message),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        });
    }
}