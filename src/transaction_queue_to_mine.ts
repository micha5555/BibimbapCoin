import {Transaction} from "./transactions/transaction";

export class TransactionQueueToMine {
    private _queue: Transaction[] = [];

    addTransactionToQueue(item: Transaction): void {
        // TODO: Add only if not already in the queue
        // console.log("Adding item to mine: " + item);
        // console.log("Type of item: " + typeof item);
        this._queue.push(item);
    }

    getTransactionToMine(): Transaction | undefined {
        return this._queue.shift();
    }

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
}