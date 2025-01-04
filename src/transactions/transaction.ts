import {createHash, randomUUID} from "node:crypto";
import {deserialize, Exclude, Expose, serialize, Type} from "class-transformer";
import {TransactionInput} from "./transaction_input";
import {TransactionOutput} from "./transaction_output";
import {Blockchain} from "../blockchain";
import {OpenTransactions} from "./transactions_open";


@Exclude()
export class Transaction {
    @Expose()
    @Type(() => TransactionInput)
    public inputTransactions: TransactionInput[];
    @Expose()
    @Type(() => TransactionOutput)
    public outputTransactions: TransactionOutput[];
    @Expose()
    @Type(() => Date)
    public timestamp: Date;

    public transactionHash: string;
    @Expose()
    public publicKey: string;
    @Expose()
    public transactionSignature: string;
    
    constructor(inputTransactions: TransactionInput[], outputTransactions: TransactionOutput[], timestamp: Date, publicKey: string, transactionSignature: string) {
        this.inputTransactions = inputTransactions;
        this.outputTransactions = outputTransactions;
        this.timestamp = timestamp;
        this.publicKey = publicKey;
        this.transactionSignature = transactionSignature;
        this.transactionHash = "";
    }

    static recreateTransactionJson(jsonString: string): Transaction {
        console.log("in recreateTransactionJson");
        console.log(jsonString);
        let transaction: Transaction = deserialize(Transaction, jsonString);
        console.log(transaction);
        console.log(typeof transaction);
        transaction.transactionHash = transaction.getTransactionHash();
        return transaction;
    }

    static createCoinbaseTransaction(amount: number, address: string, date: Date): Transaction {
        let transactionOutput = TransactionOutput.TransactionToAddress(amount, address);
        let transaction = new Transaction([], [transactionOutput], date, "", "");
        transaction.transactionHash = transaction.getTransactionHash();
        return transaction;
    }

    public toJson(): any {
        let jsonInputTransactions = this.inputTransactions.map(inputTransaction => inputTransaction.toJson());
        let jsonOutputTransactions = this.outputTransactions.map(outputTransaction => outputTransaction.toJson());
        return {inputTransactions: jsonInputTransactions, outputTransactions: jsonOutputTransactions, timestamp: this.timestamp, publicKey: this.publicKey, transactionSignature: this.transactionSignature};
        // return JSON.stringify(this);
    }

    public toJsonString(): string {
        // let jsonInputTransactions = this.inputTransactions.map(inputTransaction => inputTransaction.toJson());
        // let jsonOutputTransactions = this.outputTransactions.map(outputTransaction => outputTransaction.toJson());
        // return JSON.stringify({inputTransactions: jsonInputTransactions, outputTransactions: jsonOutputTransactions, timestamp: this.timestamp, publicKey: this.publicKey, transactionSignature: this.transactionSignature});
        return serialize(this);
    }

    public getTransactionHash() : string{
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
            .digest('hex')
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

    public verifyTransaction(blockchain: Blockchain, openTransactions: OpenTransactions) { //TODO: Verify the transaction
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