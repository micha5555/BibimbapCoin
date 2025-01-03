import {TransactionContainer} from "../src/transactions/transaction_container";

describe("TransactionContainer.toJsonString", () => {
    it("should return an empty transactions JSON string", () => {
        let transactionContainer = new TransactionContainer();
        let json = transactionContainer.toJsonString();
        expect(json).toBe('{"transactions":[]}');
    });
});