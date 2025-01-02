import {Node} from "./node";
import {DigitalWallet} from "../wallet/digital_wallet";

export class NodeWallet extends Node {
    private _digitalWallet: DigitalWallet = new DigitalWallet();

    get getDigitalWallet(): DigitalWallet {
        return this._digitalWallet;
    }

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

    async parseToJsonObject(): Promise<string> {
        // Assuming `this._data` holds the new array format
        const processedData = await Promise.all(
            this._digitalWallet.usersIdentities.map(async (item: { port: number; password: string; identities: Array<{ privateKey: string; publicKey: string }> }) => {
                const identities = item.identities.map(identity => {
                    return {
                        privateKey: identity.privateKey, // Encrypt using item's password
                        publicKey: identity.publicKey
                    };
                });

                // const hashedPassword = await hashPassword(item.password); // Hash the item's password

                return {
                    port: item.port,
                    password: item.password,
                    identities: identities
                };
            })
        );

        return JSON.stringify(processedData); // Convert processed array to JSON string
    }

    async saveNodeToFile(): Promise<void> {
        const fs = require('fs');
        let dir = './data';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        if(!fs.existsSync(dir + '/' + this.port)){
            fs.mkdirSync(dir + '/' + this.port);
        }
        let fileName = dir + "/" + this.port + "/wallet_data.json";

        const promiseParsedJSON = this.parseToJsonObject();
        const parsedJSON = await promiseParsedJSON.then((value) => {return value});
        fs.writeFileSync(fileName, parsedJSON);
    }


    async loadDigitalWalletFromFile(): Promise<void> {
        const fs = require('fs');
        let fileName = './data/' + this.port + '/wallet_data.json';
        if (!fs.existsSync(fileName)) {
            this._digitalWallet = new DigitalWallet();
            return;
        }
        let data = fs.readFileSync(fileName);
        let dataJSON = JSON.parse(data);

        this._digitalWallet = new DigitalWallet();

        dataJSON.forEach((user: { port: number, password: string, identities: { privateKey: string, publicKey: string }[] }) => {
            user.identities.forEach((identity: { privateKey: string, publicKey: string }) => {
                this._digitalWallet.addIdentity(user.port, user.password, identity.privateKey, identity.publicKey);
            });
        });
    }
}