import {Transaction} from "./transactions/transaction";
import {blockchain, openTransactions, openTransactionsCopy} from "./index";

export class TransactionQueueToMine {
    private _queue: Transaction[] = [];

    addTransactionToQueue(item: Transaction): void {
        // TODO: całkowita walidacja transakcji
        // console.log("Adding item to mine: " + item);
        // console.log("Type of item: " + typeof item);
        let shouldAddTransactionToQueue = item.verifyTransaction(blockchain, openTransactionsCopy);
        if(shouldAddTransactionToQueue) {
            this._queue.push(item);
            this.updateCopyOfOpenTransactionsBasedOnNewTransaction(item);
        }
    }

    getTransactionToMine(): Transaction | undefined {
        return this._queue.shift();
    }

    // TODO: czy to powinno być tak robione?
    getTransactionsToMine(): Transaction[] {
        let transactions =  this._queue;
        this._queue = [];
        return transactions;
    }

    get getQueue(): Transaction[] {
        return this._queue;
    }

    isEmpty(): boolean {
        return this._queue.length === 0;
    }

    removeTransactionFromQueue(item: Transaction): void {
        let hashToRemove = item.getTransactionHash();
        for (let i = 0; i < this._queue.length; i++) {
            if (this._queue[i].getTransactionHash() === hashToRemove && this._queue[i].equals(item)) {
                this._queue.splice(i, 1);
                return;
            }
        }
    }

    private updateCopyOfOpenTransactionsBasedOnNewTransaction(transaction: Transaction): void {
        if(transaction === undefined) {
            return;
        }
        // for (let outputTransaction of transaction.outputTransactions) {
        //     openTransactionsCopy.addTransaction(outputTransaction, -1, -1);
        // }
        for(let inputTransaction of transaction.inputTransactions) {
            openTransactionsCopy.removeTransactionById(inputTransaction.transactionOutputId);
        }
    }
}