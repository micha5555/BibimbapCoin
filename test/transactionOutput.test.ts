import { describe, it, expect } from '@jest/globals';
import {TransactionOutput} from "../src/transactions/transaction_output";


describe('synchronous passing test', () => {
    it('should pass because it does not throw an exception', () => {
        expect(1).toBe(1);
    });
});

describe('TransactionOutput', () => {
    it('should be created with correct values', () => {
        let transactionOutput = new TransactionOutput("ID", 100, "address");
        expect(transactionOutput.id).toBe("ID");
        expect(transactionOutput.amount).toBe(100);
        expect(transactionOutput.address).toBe("address");
    });
});

describe('TransactionToAddress', () => {
    it('should work correctly', () => {
        let transactionOutput = TransactionOutput.TransactionToAddress(100, "address");
        expect(transactionOutput.amount).toBe(100);
        expect(transactionOutput.address).toBe("address");
        expect(transactionOutput.id).not.toBe("");
        expect(transactionOutput.id).not.toBeUndefined();
    });
});

describe('TransactionOutput.toJson', () => {
    it('should return a JSON object', () => {
        let transactionOutput = new TransactionOutput("ID", 100, "address");
        let json = transactionOutput.toJson();
        expect(json).toBe('{"id":"ID","address":"address","amount":100}');
    });
});
