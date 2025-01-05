import {Transaction} from "./transactions/transaction";

export class ListToMine {
    private _queue: Transaction[] = [];

    addItemToMine(item: Transaction): void {
        this._queue.push(item);
    }

    getBlockToMine(): Transaction | undefined {
        return this._queue.shift();
    }

    get getQueue(): Transaction[] {
        return this._queue;
    }

    isEmpty(): boolean {
        return this._queue.length === 0;
    }

    removeItemFromMine(item: Transaction): void {
        const index = this._queue.indexOf(item);
        if (index > -1) {
            this._queue.splice(index, 1);
        }
    }
}