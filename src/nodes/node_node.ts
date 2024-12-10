import {Node} from "./node";

export class NodeNode extends Node {
    private _identities: string[] = [];
    private _password: string = "";
    private _walletPort: number = 0;

    addIdentity(identity: string): void {
        this._identities.push(identity);
    }

    addIdentities(identities: string[]): void {
        this._identities = identities;
    }

    getIdentities(): string[] {
        return this._identities;
    }

    setPassword(password: string): void {
        this._password = password;
    }

    getPassword(): string {
        return this._password;
    }

    setWalletPort(port: number): void {
        this._walletPort = port;
    }

    getWalletPort(): number {
        return this._walletPort;
    }
}