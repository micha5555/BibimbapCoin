import {TransactionOutput} from "./transaction";

export class OpenTransactions {
    private _transactionsMap = new Map<[string, string], TransactionOutput>();
    private lastCheckedBlockIndex: number = -1;

    addTransaction(transaction: TransactionOutput): void {
        this._transactionsMap.set([transaction.id, transaction.address], transaction);
    }

    getTransaction(transactionId: string, address: string): TransactionOutput | undefined {
        return this._transactionsMap.get([transactionId, address]);
    }

    getAllTransactions(): TransactionOutput[] {
        return Array.from(this._transactionsMap.values());
    }

    isTransactionInOpenTransactions(transactionId: string, address: string): boolean {
        return this._transactionsMap.has([transactionId, address]);
    }

    removeTransaction(transactionId: string, address: string): void {
        this._transactionsMap.delete([transactionId, address]);
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