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
        let userData = this._digitalWallet.userData;
        if(userData === null) {
            return JSON.stringify({});
        }
        let userIdentities = this._digitalWallet.userData.identities.map(identity => {
            return {
                privateKey: identity.privateKey,
                publicKey: identity.publicKey
            }
        });
        // const processedData = await Promise.all(
        //     this._digitalWallet.userData.map(async (item: { port: number; password: string; identities: Array<{ privateKey: string; publicKey: string }> }) => {
        //         const identities = item.identities.map(identity => {
        //             return {
        //                 privateKey: identity.privateKey, // Encrypt using item's password
        //                 publicKey: identity.publicKey
        //             };
        //         });
        //
        //         // const hashedPassword = await hashPassword(item.password); // Hash the item's password
        //
        //
        //
        //         return {
        //             port: item.port,
        //             password: item.password,
        //             identities: identities
        //         };
        //     })
        // );

        return JSON.stringify({
            port: this._digitalWallet.userData.port,
            password: this._digitalWallet.userData.password,
            digitalWallet: userIdentities
        })

        // return JSON.stringify(processedData); // Convert processed array to JSON string
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

        // this._digitalWallet = new DigitalWallet();
        console.log(dataJSON);

        // this._digitalWallet.addIdentity(dataJSON.port, dataJSON.password, dataJSON.digitalWallet.privateKey, dataJSON.digitalWallet.publicKey);

        this._digitalWallet = new DigitalWallet();
        if(dataJSON.port != undefined && dataJSON.password != undefined) {
            this._digitalWallet.setPortAndPassword(dataJSON.port, dataJSON.password);
        }

        if(dataJSON.identities == undefined) {
            return;
        }
        let walletIdentities = dataJSON.identities.map((identity: { privateKey: string, publicKey: string}) => {
            return {
                privateKey: identity.privateKey,
                publicKey: identity.publicKey
            }
        });

        walletIdentities.forEach((identity: { privateKey: string, publicKey: string }) => {
            this._digitalWallet.addIdentity(identity.privateKey, identity.publicKey);
        });

        // dataJSON.forEach((user: { port: number, password: string, identities: { privateKey: string, publicKey: string }[] }) => {
        //     user.identities.forEach((identity: { privateKey: string, publicKey: string }) => {
        //         this._digitalWallet.addIdentity(user.port, user.password, identity.privateKey, identity.publicKey);
        //     });
        // });
    }
}