
import {createHash} from "node:crypto";
import {deserialize} from "class-transformer";
import {Transaction} from "./transactions/transaction";

export class TransactionsContainer {
    private transactions: Transaction[] = [];

    addCoinbaseTransaction(transaction: Transaction) {
        this.transactions.push(transaction);
    }

    addTransaction(transaction: Transaction) {
        let verified = false;
        if (this.transactions.length == 0) {
            verified = transaction.verifyRewardTransaction();
        }
        else {
            verified = transaction.verifyTransaction();
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

    verifyTransactions() : boolean {
        for (let transaction of this.transactions.slice(1)) {
            if (!transaction.verifyTransaction()) {
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
        let jsonTransactions = this.transactions.map(transaction => transaction.toJson());
        // return JSON.stringify({transactions: jsonTransactions});
        return JSON.stringify(this);
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

    static fromJson(json: any): TransactionsContainer {
        return deserialize(TransactionsContainer, json);
    }
}