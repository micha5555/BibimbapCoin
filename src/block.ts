import {createHash} from "node:crypto";

export class Block {
    private index: number;
    private previousHash: string;
    private startTimestamp: Date;
    private timestamp: Date | null = null;
    private data: string;
    private hash: string = "";
    private nonce: number;
    private minerId: string;
    // TODO: trzymanie trudności?

    constructor(index: number, previousHash: string, startTimestamp: Date, data: string, hash: string, nonce: number, minerId: string) {
        this.index = index;
        this.previousHash = previousHash;
        this.startTimestamp = startTimestamp;
        this.data = data;
        this.nonce = nonce;
        this.minerId = minerId;
        this.hash = hash;
    }

    static generate(index: number, previousHash: string, startTimestamp: Date, data: string, minerId: string): Block {
        return new Block(index, previousHash, startTimestamp, data, "", 0, minerId);
    }

    static generateGenesis(): Block {
        const dataToHash = "Genesis Block";
        var genesisBlock = new Block(0, "", new Date("2024-12-09T16:01:19.692Z"), dataToHash, "", 0, "");
        genesisBlock.calculateHash();
        return genesisBlock;
    }

    static fromJson(json: any): Block {
        let block: Block = new Block(Number(json.index), String(json.previousHash), new Date(json.startTimestamp), String(json.data), String(json.hash), Number(json.nonce), String(json.minerId));
        block.timestamp = new Date(json.timestamp);
        return block;
    }

    get getIndex(): number {
        return this.index;
    }

    get getPreviousHash(): string {
        return this.previousHash;
    }

    getTimestamp(): Date | null {
        return this.timestamp;
    }

    setTimestamp(timestamp: Date) {
        this.timestamp = timestamp;
    }

    get getData(): string {
        return this.data;
    }

    calculateHash(): void {
        let hashBuffer = createHash('sha256')
            .update(this.index + this.previousHash + this.data + this.nonce + this.minerId + this.startTimestamp.toISOString())
            .digest();

        this.hash = Array.from(hashBuffer)
            .map(byte => byte.toString(2).padStart(8, '0')) // Konwertuje każdy bajt na 8-bitowy ciąg binarny
            .join('');
    }

    get getHash(): string { //TODO: Display as Hex
        return this.hash;
    }

    getDisplayHash(): string {
        let binaryString = this.hash;
        if (binaryString.length % 4 !== 0) {
            // Dopasowanie długości do wielokrotności 4 przez dodanie wiodących zer
            binaryString = binaryString.padStart(Math.ceil(binaryString.length / 4) * 4, '0');
        }

        let hexString = '';
        for (let i = 0; i < binaryString.length; i += 4) {
            const binarySegment = binaryString.slice(i, i + 4); // Wyciągnij 4 bity
            const hexValue = parseInt(binarySegment, 2).toString(16); // Konwertuj na HEX
            hexString += hexValue; // Dodaj wynik
        }

        return hexString;
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

    getStartTimestamp(): Date {
        return this.startTimestamp;
    }

    toString(): string {
        return `Block #${this.index} [
            previousHash: ${this.previousHash}, 
            startTimestamp: ${this.startTimestamp.toISOString()},
            timestamp: ${this.timestamp?.toISOString()}, 
            data: ${this.data}, 
            hash: ${this.getDisplayHash()},
            nonce: ${this.nonce}, 
            minerId: ${this.minerId}
        ]`;
    }

    toJson() : string {
        return JSON.stringify(this);
    }

    isFound(difficulty: number): boolean {
        return this.hash.substring(0, difficulty) === "0".repeat(difficulty); //TODO: Change check in binary format
    }
}