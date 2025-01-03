import {createHash} from "node:crypto";
import {blockchain, openTransactions} from "./index";
import {TransactionContainer} from "./transactions/transaction_container";
import {Transaction} from "./transactions/transaction";
import {TransactionInput} from "./transactions/transaction_input";

export class Block {
    private index: number;
    private previousHash: string;
    private startTimestamp: Date;
    private timestamp: Date | null = null;
    private data: TransactionContainer;
    private hash: string = "";
    private nonce: number;
    private difficulty: number;
    private minerId: string;

    constructor(index: number, previousHash: string, startTimestamp: Date, data: TransactionContainer, hash: string, nonce: number, difficulty: number, minerId: string) {
        this.index = index;
        this.previousHash = previousHash;
        this.startTimestamp = startTimestamp;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;
        this.minerId = minerId;
        this.hash = hash;
    }

    static generate(index: number, previousHash: string, startTimestamp: Date, data: TransactionContainer, minerId: string, difficulty: number): Block {
        return new Block(index, previousHash, startTimestamp, data, "", 0, difficulty, minerId);
    }

    static generateGenesis(): Block {
        // console.log('Transaction:', Transaction);
        const genesisDate = new Date("2024-12-09T16:01:19.692Z");
        const transactionsCoinbase = new TransactionContainer();
        transactionsCoinbase.addCoinbaseTransaction(Transaction.createCoinbaseTransaction(100, "MCowBQYDK2VwAyEAPMOQa0GAygWV7nvY5iKrdDZt/oLsy54UC7RxXHTBR9k=", genesisDate));
        transactionsCoinbase.addCoinbaseTransaction(Transaction.createCoinbaseTransaction(100, "MCowBQYDK2VwAyEASCJu120RBQqLoyZ8+KyUCwZA/eRLxFDJATm1d2W89eU=", genesisDate));
        var genesisBlock = new Block(0, "", genesisDate, transactionsCoinbase, "", 0, 0, "GENESIS BLOCK");
        genesisBlock.calculateHash();
        return genesisBlock;
    }

    static fromJson(json: any): Block {
        let block: Block = new Block(Number(json.index), String(json.previousHash), new Date(json.startTimestamp), TransactionContainer.fromJson(JSON.stringify(json.data)), String(json.hash), Number(json.nonce), Number(json.difficulty), String(json.minerId));
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

    get getData(): TransactionContainer {
        return this.data;
    }

    calculateHash(): void {
        let hashBuffer = createHash('sha256')
            .update(this.index + this.previousHash + this.data.getCalculatedHash() + this.nonce + this.minerId + this.startTimestamp.toISOString())
            .digest();

        this.hash = Array.from(hashBuffer)
            .map(byte => byte.toString(2).padStart(8, '0')) // Konwertuje każdy bajt na 8-bitowy ciąg binarny
            .join('');
    }

    get getHash(): string { //TODO: Display as Hex
        return this.hash;
    }

    verifyNew() : boolean {
        // Verify if the hash and calculated hash are the same
        let sentHash = this.hash;
        this.calculateHash();
        if(sentHash != this.hash) {
            console.error("Hashes are not equal");
            return false;
        }

        // Verify if the difficulty is expected
        if(this.difficulty != blockchain.nextBlockDifficulty) {
            console.error("Difficulty is not correct. Expected: " + blockchain.nextBlockDifficulty + " but got: " + this.difficulty);
            return false;
        }

        //Verify if the difficulty is correct
        if(!this.isFound()) {
            console.error("Block is not mined correctly");
            return false;
        }

        // Verify if the previous hash matches the hash of the previous block
        let lastBlock = blockchain.getLastBlock();
        if (lastBlock.getDisplayHash() != this.previousHash) {
            console.error("Previous hash is not correct. Expected: " + lastBlock.getDisplayHash() + " but got: " + this.previousHash);
            return false;
        }

        // Verify if the index is + 1 from the previous block
        if(lastBlock.index + 1 != this.index) {
            console.error("Block index is not correct. Expected: " + (lastBlock.index + 1) + " but got: " + this.index);
            return false;
        }

        // If second block - no reward transaction
        // Verify reward transaction
        if(this.index > 1)
        {
            if(this.data.verifyRewardTransaction())
            {
                return false;
            }
        }

        // Verify rest of the transactions
        if (!this.data.verifyTransactions(blockchain, openTransactions)) {
            return false;
        }

        return true;
    }

    verifyExisting() : boolean {
        // Verify if the hash and calculated hash are the same
        let sentHash = this.hash;
        this.calculateHash();
        if(sentHash != this.hash) {
            console.error("Hashes are not equal");
            return false;
        }

        // Verify if the hashes of the block and adequate block in the blockchain are the same
        let adequateBlock = blockchain.getBlock(this.index);
        if(adequateBlock.hash != this.hash) {
            console.error("Hashes are not equal");
            return false;
        }

        return true;
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
            data: ${this.data.toJsonString()}, 
            hash: ${this.getDisplayHash()},
            nonce: ${this.nonce}, 
            difficulty: ${this.difficulty},
            minerId: ${this.minerId}
        ]`;
    }

    toJson() : string {
        return JSON.stringify(this);
    }

    isFound(): boolean {
        return this.hash.substring(0, this.difficulty) === "0".repeat(this.difficulty); //TODO: Change check in binary format
    }
}