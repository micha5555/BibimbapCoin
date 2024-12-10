import {createHash, randomUUID} from "node:crypto";
import {blockchain, openTransactions} from "./index";

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

    static createCoinbaseTransaction(amount: number, address: string, date: Date): Transaction {
        let transactionOutput = TransactionOutput.TransactionToAddress(amount, address);
        let transaction = new Transaction([], [transactionOutput], date, "", "");
        transaction.transactionHash = transaction.getTransactionHash();
        return transaction;
    }

    public toJson(): string {
        return JSON.stringify(this);
    }

    private getTransactionHash() : string{
        let hashToCalc = "";

        for (let inputTransaction of this.inputTransactions) {
            hashToCalc += inputTransaction.calculateHash();
        }
        for (let outputTransaction of this.outputTransactions) {
            hashToCalc += outputTransaction.calculateHash();
        }

        hashToCalc += this.timestamp + this.publicKey;
        return createHash('sha256')
            .update(hashToCalc)
            .digest()
            .toString();
    }

    public signTransaction(privateKey: string) { //TODO: Sign the transaction
        //TODO: USE RANDOM NONCE
    }

    public verifyRewardTransaction() { //TODO: Verify reward miner transaction
        // Verify if the transaction is a reward transaction - if it has no input transactions
        if (this.inputTransactions.length !== 0) {
            return false;
        }

        // Verify if the transaction is a reward transaction - if it has only one output transaction
        if (this.outputTransactions.length !== 1) {
            return false;
        }

        // Verify if the transaction is a reward transaction - if the amount is correct - TODO: add fee verification

        // Verify if the transaction is a reward transaction - if the address is correct

        return true;
    }

    public verifyTransaction() { //TODO: Verify the transaction
        // Verify input transactions - if they are unspent
        for (let inputTransaction of this.inputTransactions) {
            let block = blockchain.getBlock(inputTransaction.blockIndex);
            if (block === undefined) {
                return false;
            }
            let transaction = block.getData.getTransaction(inputTransaction.transactionIndex);
            if (transaction === undefined) {
                return false;
            }

            let transactionOutput = transaction.outputTransactions
                .find(outputTransaction => outputTransaction.id === inputTransaction.transactionOutputId);
            if (transactionOutput === undefined) {
                return false;
            }

            inputTransaction.address = transactionOutput.address;
            inputTransaction.amount = transactionOutput.amount;

            let isThere = openTransactions.isTransactionInOpenTransactions(
                inputTransaction.transactionOutputId, inputTransaction.address,
                inputTransaction.transactionIndex, inputTransaction.blockIndex);
            if (!isThere) {
                return false;
            }
            let openTransaction = openTransactions.getTransaction(
                inputTransaction.transactionOutputId, inputTransaction.address,
                inputTransaction.transactionIndex, inputTransaction.blockIndex);
            if (openTransaction === undefined) {
                return false;
            }
            let isUnspent = !openTransaction.tempBlocked;
            if (!isUnspent) {
                return false;
            }
        }

        // Verify public keys from input transactions - if they match the public key of the transaction
        for (let inputTransaction of this.inputTransactions) {
            if (inputTransaction.address !== this.publicKey) {
                return false;
            }
        }

        // Verify the signature of the transaction - if hashes match
        //TODO: Verify the signature of the transaction - if hashes match

        // Verify the output transactions - if they are valid
        for (let outputTransaction of this.outputTransactions) {
            if (outputTransaction.amount <= 0) {
                return false;
            }
            if (outputTransaction.address === undefined) {
                return false;
            }
            if (outputTransaction.id === undefined) {
                return false;
            }
        }

        // Verify if the sum of input transactions is equal to the sum of output transactions - TODO add fee verification
        let sumInput = 0;
        let sumOutput = 0;
        for (let inputTransaction of this.inputTransactions) {
            sumInput += inputTransaction.amount;
        }
        for (let outputTransaction of this.outputTransactions) {
            sumOutput += outputTransaction.amount;
        }
        if (sumInput !== sumOutput) {
            return false;
        }

        return true;
    }
}

export class TransactionInput {
    public transactionOutputId: string;
    public transactionIndex: number;
    public blockIndex: number;
    public address: string;
    public amount: number = 0;

    constructor(transactionOutputId: string, transactionIndex: number, blockIndex: number, address: string) {
        this.transactionOutputId = transactionOutputId;
        this.transactionIndex = transactionIndex;
        this.blockIndex = blockIndex;
        this.address = address;
    }

    calculateHash() : string {
        return createHash('sha256')
            .update(this.transactionOutputId + this.transactionIndex + this.blockIndex)
            .digest()
            .toString();
    }
}

export class TransactionOutput {
    public id: string;
    public address: string;
    public amount: number;
    public tempBlocked: boolean = false;
    public blockIndex: number = -1;
    public transactionIndex: number = -1;

    constructor(id: string, amount: number, address: string) {
        this.id = id;
        this.amount = amount;
        this.address = address;
    }

    static TransactionToAddress(amount: number, address: string) : TransactionOutput {
        return new TransactionOutput(randomUUID(), amount, address);
    }

    calculateHash() : string {
        return createHash('sha256')
            .update(this.id + this.amount + this.address)
            .digest()
            .toString();
    }

}