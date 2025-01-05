import {TransactionOutput} from "./transaction_output";

export class OpenTransactions {
    //Tuple - outputTransactionId, transactionIndex, blockIndex, address
    private _transactionsMap = new Map<[string, number, number, string], TransactionOutput>();

    addTransaction(transaction: TransactionOutput, transactionIndex: number, blockIndex :number): void {
        transaction.transactionIndex = transactionIndex;
        transaction.blockIndex = blockIndex;
        this._transactionsMap.set([transaction.id, transactionIndex, blockIndex, transaction.address], transaction);
    }

    getTransaction(transactionId: string, address: string,  transactionIndex: number, blockIndex :number): TransactionOutput | undefined {
        return this._transactionsMap.get([transactionId,  transactionIndex, blockIndex, address]);
    }

    getAllTransactions(): TransactionOutput[] {
        return Array.from(this._transactionsMap.values());
    }

    getTransactionsForAddress(address: string): TransactionOutput[] {
        return Array
            .from(this._transactionsMap.values())
            .filter(transaction => transaction.address === address);
    }

    getMoneyForAddress(address: string): number {
        return this.getTransactionsForAddress(address)
            .reduce((sum, transaction) => sum + transaction.amount, 0);
    }

    isTransactionInOpenTransactions(transactionId: string, address: string,  transactionIndex: number, blockIndex :number): boolean {
        return this._transactionsMap.has([transactionId,  transactionIndex, blockIndex,address]);
    }

    removeTransaction(transactionId: string, address: string,  transactionIndex: number, blockIndex :number): void {
        this._transactionsMap.delete([transactionId,  transactionIndex, blockIndex,address]);
    }

    // I am using this to remove input transactions
    removeTransactionById(transactionId: string): void {
        this._transactionsMap.forEach((transaction, key) => {
            if (transaction.id === transactionId) {
                this._transactionsMap.delete(key);
            }
        });
    }

    //Potentially to save and load from file - should be handled somewhere else
    loadFromJson(json: string): void {
        let openTransactions = JSON.parse(json);
        this._transactionsMap = new Map(openTransactions);
    }

    toJson(): string {
        return JSON.stringify(Array.from(this._transactionsMap.entries()));
    }
}