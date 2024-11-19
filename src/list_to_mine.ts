export class ListToMine {
    private _queue: any[] = [];

    addItemToMine(item: any): void {
        this._queue.push(item);
    }

    getBlockToMine(): any | undefined {
        return this._queue.shift();
    }

    get getQueue(): any[] {
        return this._queue;
    }

    isEmpty(): boolean {
        return this._queue.length === 0;
    }

    removeItemFromMine(item: any): void {
        const index = this._queue.indexOf(item);
        if (index > -1) {
            this._queue.splice(index, 1);
        }
    }
}