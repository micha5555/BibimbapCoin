import {createId, generateKeys, hashPassword} from "./crypto_utils";

export class DigitalWallet {
    private _identities: { privateKey: string, publicKey: string, id: string }[] = [];

    get identities(): { privateKey: string; publicKey: string; id: string }[] {
        return this._identities;
    }

    addIdentity(privateKey: any, publicKey: any, id: string): void {
        this._identities.push({ privateKey, publicKey, id });
    }

}