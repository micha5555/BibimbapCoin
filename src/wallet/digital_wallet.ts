import {hashPassword} from "../crypto_utils";

export class DigitalWallet {
    private _usersIdentities: { port: number, password:string, identities: { privateKey: string, publicKey: string}[] }[] = [];

    get usersIdentities(): { port: number; password: string; identities: { privateKey: string; publicKey: string }[] }[] {
        return this._usersIdentities;
    }

    addIdentity(port:number, password:string, privateKey: any, publicKey: any ): void {
        let user = this._usersIdentities.find((user) => user.port === port);
        if (user === undefined) {
            this._usersIdentities.push({ port, password, identities: [{ privateKey, publicKey }] });
        } else {
            user.identities.push({ privateKey, publicKey });
        }
    }

    async registerUser(port: number, passwordNonHashed: string): Promise<void> {
        const promiseHashedUserPassword = hashPassword(passwordNonHashed);
        const password = await promiseHashedUserPassword.then((value) => {
            return value
        });
        this._usersIdentities.push({ port, password, identities: [] });
    }

    toString(): string {
        return JSON.stringify(this._usersIdentities);
    }

    // private _identities: { privateKey: string, publicKey: string}[] = [];
    //
    // get identities(): { privateKey: string; publicKey: string }[] {
    //     return this._identities;
    // }
    //
    // addIdentity(privateKey: any, publicKey: any ): void {
    //     this._identities.push({ privateKey, publicKey });
    // }
    //
    // getIdentityBypublicKey(publicKey: string): { privateKey: string; publicKey: string} | undefined {
    //     return this._identities.find((identity) => identity.publicKey === publicKey);
    // }

}