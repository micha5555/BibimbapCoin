import {hashPassword} from "../crypto_utils";

export class DigitalWallet {
    private _userData: { port: number, password:string, identities: { privateKey: string, publicKey: string}[] } | null = null;

    setPortAndPassword(port: number, password: string): void {
        this._userData = ({ port, password, identities : [] });
    }

    get userData(): { port: number; password: string; identities: { privateKey: string; publicKey: string }[] } {
        return this._userData!;
    }

    addIdentity(/*port:number, password:string, */privateKey: any, publicKey: any ): void {
        let portInWallet = this._userData!!.port;
        if (portInWallet === undefined) {
            console.error("User not registered");
            // this._userData = ({ port, password, identities: [{ privateKey, publicKey }] });
        } else {
            this._userData!!.identities.push({ privateKey, publicKey });
        }
    }

    async registerUser(port: number, passwordNonHashed: string): Promise<void> {
        const promiseHashedUserPassword = hashPassword(passwordNonHashed);
        const password = await promiseHashedUserPassword.then((value) => {
            return value
        });
        this._userData!! = ({ port, password, identities: [] });
    }

    toString(): string {
        return JSON.stringify(this._userData);
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