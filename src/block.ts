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

    get data(): string {
        return this._data;
    }

    get hash(): string {
        return this._hash;
    }

    get nonce(): number {
        return this._nonce;
    }

    get minerId(): string {
        return this._minerId;
    }
}