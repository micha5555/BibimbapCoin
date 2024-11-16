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
}