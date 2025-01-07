
import {createHash} from "node:crypto";
import {deserialize, Exclude, Expose, serialize, Type} from "class-transformer";
import {Transaction} from "./transaction";
import {Blockchain} from "../blockchain";
import {OpenTransactions} from "./transactions_open";

@Exclude()
export class TransactionContainer {
    @Expose()
    @Type(() => Transaction)
    private transactions: Transaction[] = [];

    constructor(transactions: Transaction[] = []) {
        this.transactions = transactions;
    }

    addCoinbaseTransaction(transaction: Transaction) {
        this.transactions.push(transaction);
    }

    addTransaction(transaction: Transaction, blockchain: Blockchain, openTransactions: OpenTransactions) {
        let verified = false;
        if (this.transactions.length == 0) {
            verified = transaction.verifyRewardTransaction();
        }
        else {
            verified = transaction.verifyTransaction(blockchain, openTransactions);
        }
        if (!verified) {
            console.log("Transaction verification failed");
            return;
        }
        this.transactions.push(transaction);
    }

    verifyRewardTransaction() : boolean{
        if(this.transactions.length == 0) {
            return false;
        }

        return this.transactions[0].verifyRewardTransaction();
    }

    verifyTransactions(blockchain: Blockchain, openTransactions: OpenTransactions) : boolean {
        for (let transaction of this.transactions) {
            if (!transaction.verifyTransaction(blockchain,openTransactions)) {
                return false;
            }
        }
        return true;
    }

    getTransactions(): Transaction[] {
        return this.transactions;
    }

    getTransaction(index: number): Transaction | undefined{
        if(index < 0 || index >= this.transactions.length) {
            return undefined;
        }
        return this.transactions[index];
    }

    toJsonString(): string {
        // let jsonTransactions = this.transactions.map(transaction => transaction.toJson());
        // // return JSON.stringify({transactions: jsonTransactions});
        // return JSON.stringify(this);
        return serialize(this);
    }

    getCalculatedHash(): string {
        let hashToCalc = "";
        for (let transaction of this.transactions) {
            hashToCalc += transaction.toJson();
        }
        return createHash('sha256')
            .update(hashToCalc)
            .digest()
            .toString();
    }

    static fromJson(json: string): TransactionContainer {
        return deserialize(TransactionContainer, json);
    }
}