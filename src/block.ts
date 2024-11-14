import {createHash} from "node:crypto";

export class Block {
    private _index: number;
    private _previousHash: string;
    private _timestamp: Date;
    private _data: string;
    private _hash: string;
    private _nonce: number;
    private _minerId: string;

    constructor(index: number, previousHash: string, timestamp: Date, data: string, hash: string, nonce: number, minerId: string) {
        this._index = index;
        this._previousHash = previousHash;
        this._timestamp = timestamp;
        this._data = data;
        this._hash = hash;
        this._nonce = nonce;
        this._minerId = minerId;
    }

    get index(): number {
        return this._index;
    }

    get previousHash(): string {
        return this._previousHash;
    }

    get timestamp(): Date {
        return this._timestamp;
    }

    set timestamp(timestamp: Date) {
        this._timestamp = timestamp;
    }

    get data(): string {
        return this._data;
    }

    calculateHash(): void {
        this._hash = createHash('sha256')
            .update(this._index + this._previousHash + this._data + this._nonce + this._minerId)
            .digest('hex');
    }

    get hash(): string {
        return this._hash;
    }

    get nonce(): number {
        return this._nonce;
    }

    incrementNonce(): void {
        this._nonce++;
    }

    get minerId(): string {
        return this._minerId;
    }

    toString(): string {
        return `Block #${this._index} [
            previousHash: ${this._previousHash}, 
            timestamp: ${this._timestamp}, 
            data: ${this._data}, 
            hash: ${this._hash}, 
            nonce: ${this._nonce}, 
            minerId: ${this._minerId}
        ]`;
    }
}