import {createHash, randomUUID, UUID} from "node:crypto";
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
        let transaction: Transaction = deserialize(Transaction, jsonString);
        transaction.transactionHash = transaction.getTransactionHash();
        return transaction;
    }

    static createCoinbaseTransaction(uuid: UUID, amount: number, address: string, date: Date): Transaction {
        let transactionOutput = TransactionOutput.GenesisTransaction(uuid, amount, address);
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

    // public signTransaction(privateKey: string) { //TODO: Sign the transaction
    //     //TODO: USE RANDOM NONCE
    // }
    public equals(transaction: Transaction): boolean {
        if (this.inputTransactions.length !== transaction.inputTransactions.length) {
            return false;
        }
        if (this.outputTransactions.length !== transaction.outputTransactions.length) {
            return false;
        }
        for (let i = 0; i < this.inputTransactions.length; i++) {
            if (!this.inputTransactions[i].equals(transaction.inputTransactions[i])) {
                return false;
            }
        }
        for (let i = 0; i < this.outputTransactions.length; i++) {
            if (!this.outputTransactions[i].equals(transaction.outputTransactions[i])) {
                return false;
            }
        }
        if (this.timestamp.getTime() !== transaction.timestamp.getTime()) {
            return false;
        }
        if (this.publicKey !== transaction.publicKey) {
            return false;
        }
        if (this.transactionSignature !== transaction.transactionSignature) {
            return false;
        }

        return true;
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
        let usingOpenTransactions = []
        for (let inputTransaction of this.inputTransactions) {
            let block = blockchain.getBlock(inputTransaction.blockIndex);
            if (block === undefined) {
                console.log("Block not found");
                this.unblockOpenTransactions(usingOpenTransactions);
                return false;
            }
            let transaction = block.getData.getTransaction(inputTransaction.transactionIndex);
            if (transaction === undefined) {
                console.log("Transaction not found");
                this.unblockOpenTransactions(usingOpenTransactions);
                return false;
            }

            let transactionOutput = transaction.outputTransactions
                .find(outputTransaction => outputTransaction.id === inputTransaction.transactionOutputId);
            if (transactionOutput === undefined) {
                console.log("Transaction output not found");
                this.unblockOpenTransactions(usingOpenTransactions);
                return false;
            }

            inputTransaction.address = transactionOutput.address;
            inputTransaction.amount = transactionOutput.amount;

            let isThere = openTransactions.isTransactionInOpenTransactions(
                inputTransaction.transactionOutputId);
            if (!isThere) {
                console.log("is there");
                console.log("Transaction not found in open transactions");
                this.unblockOpenTransactions(usingOpenTransactions);
                return false;
            }
            let openTransaction = openTransactions.getTransaction(
                inputTransaction.transactionOutputId);
            if (openTransaction === undefined) {
                console.log("Transaction not found in open transactions");
                this.unblockOpenTransactions(usingOpenTransactions);
                return false;
            }
            usingOpenTransactions.push(openTransaction);
            if (openTransaction[0].tempBlocked) {
                console.log("Transaction is temp blocked");
                // ???
                this.unblockOpenTransactions(usingOpenTransactions);
                return false;
            }
            openTransaction[0].tempBlocked = true;
        }

        // Verify public keys from input transactions - if they match the public key of the transaction
        for (let inputTransaction of this.inputTransactions) {
            if (inputTransaction.address !== this.publicKey) {
                console.log("Public keys do not match");
                this.unblockOpenTransactions(usingOpenTransactions);
                return false;
            }
        }

        // Verify the signature of the transaction - if hashes match
        //TODO: Verify the signature of the transaction - if hashes match

        // Verify the output transactions - if they are valid
        for (let outputTransaction of this.outputTransactions) {
            if (outputTransaction.amount <= 0) {
                console.log("Amount is less than or equal to 0");
                this.unblockOpenTransactions(usingOpenTransactions);
                return false;
            }
            if (outputTransaction.address === undefined) {
                console.log("Address is undefined");
                this.unblockOpenTransactions(usingOpenTransactions);
                return false;
            }
            if (outputTransaction.id === undefined) {
                console.log("Output transaction Id is undefined");
                this.unblockOpenTransactions(usingOpenTransactions);
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
            console.log("Sum of input transactions is not equal to the sum of output transactions");
            this.unblockOpenTransactions(usingOpenTransactions);
            return false;
        }
        return true;
    }

    unblockOpenTransactions(openTransactions: any) {
        for (let openTransaction of openTransactions) {
            openTransaction.tempBlocked = false;
        }
        return true;
    }
}