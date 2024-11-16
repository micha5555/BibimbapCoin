export class DigitalWallet {
    private _identities: { privateKey: string, publicKey: string, id: string }[] = [];

    get identities(): { privateKey: string; publicKey: string; id: string }[] {
        return this._identities;
    }

    addIdentity(privateKey: any, publicKey: any, id: string): void {
        this._identities.push({ privateKey, publicKey, id });
    }

    getIdentityById(id: string): { privateKey: string; publicKey: string; id: string } | undefined {
        return this._identities.find((identity) => identity.id === id);
    }

}