import {createHash} from "node:crypto";

export class Block {
    private index: number;
    private previousHash: string;
    private timestamp: Date;
    private data: string;
    private hash: string;
    private nonce: number;
    private minerId: string;

    constructor(index: number, previousHash: string, timestamp: Date, data: string, hash: string, nonce: number, minerId: string) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash;
        this.nonce = nonce;
        this.minerId = minerId;
    }

    static fromJson(json: any): Block {
        return new Block(json.index, json.previousHash, json.timestamp, json.data, json.hash, json.nonce, json.minerId);
    }

    get getIndex(): number {
        return this.index;
    }

    get getPreviousHash(): string {
        return this.previousHash;
    }

    get getTimestamp(): Date {
        return this.timestamp;
    }

    set setTimestamp(timestamp: Date) {
        this.timestamp = timestamp;
    }

    get getData(): string {
        return this.data;
    }

    calculateHash(): void {
        this.hash = createHash('sha256')
            .update(this.index + this.previousHash + this.data + this.nonce + this.minerId)
            .digest('hex');
    }

    get getHash(): string {
        return this.hash;
    }

    get getNonce(): number {
        return this.nonce;
    }

    incrementNonce(): void {
        this.nonce++;
    }

    get getMinerId(): string {
        return this.minerId;
    }

    toString(): string {
        return `Block #${this.index} [
            previousHash: ${this.previousHash}, 
            timestamp: ${this.timestamp}, 
            data: ${this.data}, 
            hash: ${this.hash}, 
            nonce: ${this.nonce}, 
            minerId: ${this.minerId}
        ]`;
    }

    isFound(difficulty: number): boolean {
        return this.hash.substring(0, difficulty) === "0".repeat(difficulty);
    }
}