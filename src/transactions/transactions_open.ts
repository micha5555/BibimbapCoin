import {TransactionOutput} from "./transaction_output";

export class OpenTransactions {
    //key - transaction id; value - trans, block index, transaction index
    private _transactionsMap = new Map<string, [TransactionOutput, number, number]>();

    addTransaction(transaction: TransactionOutput, transactionIndex: number, blockIndex :number): void {
        transaction.transactionIndex = transactionIndex;
        transaction.blockIndex = blockIndex;
        this._transactionsMap.set(transaction.id, [transaction, blockIndex, transactionIndex]);
    }

    getTransaction(transactionId: string): [TransactionOutput, number, number] | undefined {
        return this._transactionsMap.get(transactionId);
    }

    getAllTransactions(): [TransactionOutput, number, number][] {
        return Array.from(this._transactionsMap.values());
    }

    getTransactionsForAddress(address: string): [TransactionOutput, number, number][] {
        return Array
            .from(this._transactionsMap.values())
            .filter(transaction => transaction[0].address === address);
    }

    getMoneyForAddress(address: string): number {
        return this.getTransactionsForAddress(address)
            .reduce((sum, transaction) => sum + transaction[0].amount, 0);
    }

    isTransactionInOpenTransactions(transactionId: string): boolean {
        for(let key of this._transactionsMap.keys()){
            if(key === transactionId){
                return true;
            }
        }
        return false;
        // return this._transactionsMap.has([transactionId,  transactionIndex, blockIndex, address]);
    }

    removeTransactionById(transactionId: string): void {
        this._transactionsMap.delete(transactionId);
    }

    // I am using this to remove input transactions
    //TODO: think if anything bad can happen,do we need more validation the just simple check by ID
    // removeTransactionById(transactionId: string): void {
    //     this._transactionsMap.forEach((transaction, key) => {
    //         if (transaction.id === transactionId) {
    //             this._transactionsMap.delete(key);
    //         }
    //     });
    // }

    //Potentially to save and load from file - should be handled somewhere else
    loadFromJson(json: string): void {
        let openTransactions = JSON.parse(json);
        this._transactionsMap = new Map(openTransactions);
    }

    toJson(): string {
        return JSON.stringify(Array.from(this._transactionsMap.entries()));
    }
}