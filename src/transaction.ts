import {randomUUID} from "node:crypto";

export class Transaction {
    public inputTransactions: TransactionInput[] = [];
    public outputTransactions: TransactionOutput[] = [];
    public timestamp: Date;
    public transactionHash: string;
    public publicKey: string;
    public transactionSignature: string;
    
    constructor(inputTransactions: TransactionInput[], outputTransactions: TransactionOutput[], timestamp: Date, publicKey: string, transactionSignature: string) {
        this.inputTransactions = inputTransactions;
        this.outputTransactions = outputTransactions;
        this.timestamp = timestamp;
        this.publicKey = publicKey;
        this.transactionSignature = transactionSignature;
        this.transactionHash = this.getTransactionHash();
    }

    static recreateTransactionJson(transaction: string): Transaction {
        let jsonTransaction = JSON.parse(transaction);
        return new Transaction(jsonTransaction.inputTransactions, jsonTransaction.outputTransactions, jsonTransaction.timestamp, jsonTransaction.publicKey, jsonTransaction.transactionSignature);
    }

    public toJson(): string {
        return JSON.stringify(this);
    }

    private getTransactionHash() { //TODO: Calculate the hash of the transaction
        return "";
    }

    public signTransaction(privateKey: string) { //TODO: Sign the transaction
        //TODO: USE RANDOM NONCE
    }

    public verifyTransaction() { //TODO: Verify the transaction
        // Verify input transactions - if they are unspent

        // Verify public keys from input transactions - if they match the public key of the transaction

        // Verify the signature of the transaction - if hashes match

        // Verify the output transactions - if they are valid

        // Verify if the sum of input transactions is equal to the sum of output transactions - TODO add fee verification

    }
}

export class TransactionInput {
    public transactionOutputId: string;
    public blockIndex: number;
    public address: string;

    constructor(transactionOutputId: string, blockIndex: number, address: string) {
        this.transactionOutputId = transactionOutputId;
        this.blockIndex = blockIndex;
        this.address = address;
    }
}

export class TransactionOutput {
    public id: string;
    public address: string;
    public amount: number;

    constructor(id: string, amount: number, address: string) {
        this.id = id;
        this.amount = amount;
        this.address = address;
    }

    static TransactionToAddress(amount: number, address: string) : TransactionOutput {
        return new TransactionOutput(randomUUID(), amount, address);
    }

}