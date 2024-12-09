export class DigitalWallet {
    private _identities: { privateKey: string, publicKey: string}[] = [];

    get identities(): { privateKey: string; publicKey: string }[] {
        return this._identities;
    }

    addIdentity(privateKey: any, publicKey: any ): void {
        this._identities.push({ privateKey, publicKey });
    }

    getIdentityBypublicKey(publicKey: string): { privateKey: string; publicKey: string} | undefined {
        return this._identities.find((identity) => identity.publicKey === publicKey);
    }

}