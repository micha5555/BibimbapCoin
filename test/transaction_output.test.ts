import { describe, it, expect } from '@jest/globals';
import {TransactionOutput} from "../src/transactions/transaction_output";

describe('TransactionOutput.constructor', () => {
    it('should be created with correct values', () => {
        let transactionOutput = new TransactionOutput("ID", 100, "address");
        expect(transactionOutput.id).toBe("ID");
        expect(transactionOutput.amount).toBe(100);
        expect(transactionOutput.address).toBe("address");
    });
});

describe('TransactionOutput.TransactionToAddress', () => {
    it('should work correctly', () => {
        let transactionOutput = TransactionOutput.TransactionToAddress(100, "address");
        expect(transactionOutput.amount).toBe(100);
        expect(transactionOutput.address).toBe("address");
        expect(transactionOutput.id).not.toBe("");
        expect(transactionOutput.id).not.toBeUndefined();
    });
});

describe('TransactionOutput.calculateHash', () => {
   it('should return a hash', () => {
         let transactionOutput = new TransactionOutput("ID", 100, "address");
         let hash = transactionOutput.calculateHash();
         expect(hash).not.toBe("");
         expect(hash).not.toBeUndefined();
         expect(hash).toBe("440506a2ae51fe4701fabf4d1ea92cd9b1c1154812f798dca56356657e34d598");
   });

    it('should return a different hash for different values', () => {
            let transactionOutput1 = new TransactionOutput("ID", 100, "address");
            let transactionOutput2 = new TransactionOutput("ID", 200, "address");
            let hash1 = transactionOutput1.calculateHash();
            let hash2 = transactionOutput2.calculateHash();
            expect(hash1).not.toBe(hash2);
    });

    it('should return the same hash for the same values', () => {
            let transactionOutput1 = new TransactionOutput("ID", 100, "address");
            let transactionOutput2 = new TransactionOutput("ID", 100, "address");
            let hash1 = transactionOutput1.calculateHash();
            let hash2 = transactionOutput2.calculateHash();
            expect(hash1).toBe(hash2);
    });
});

describe('TransactionOutput.toJson', () => {
    it('should return a JSON object', () => {
        let transactionOutput = new TransactionOutput("ID", 100, "address");
        let json = transactionOutput.toJson();
        expect(json).toBe('{"id":"ID","address":"address","amount":100}');
    });
});

describe('TransactionOutput.fromJson', () => {
    it('should return a TransactionOutput object', () => {
        let json = JSON.stringify({id: "ID", amount: 100, address: "address"});
        let transactionOutput = TransactionOutput.fromJson(json);
        expect(transactionOutput.id).toBe("ID");
        expect(transactionOutput.amount).toBe(100);
        expect(transactionOutput.address).toBe("address");
    });
});

describe('TransactionOutput.equals', () => {
    it('should return true for the same values', () => {
        let transactionOutput1 = new TransactionOutput("ID", 100, "address");
        let transactionOutput2 = new TransactionOutput("ID", 100, "address");
        expect(transactionOutput1.equals(transactionOutput2)).toBe(true);
    });

    it('should return false for different values', () => {
        let transactionOutput1 = new TransactionOutput("ID", 100, "address");
        let transactionOutput2 = new TransactionOutput("ID", 200, "address");
        expect(transactionOutput1.equals(transactionOutput2)).toBe(false);
    });

    it('should return false for different addresses', () => {
        let transactionOutput1 = new TransactionOutput("ID", 100, "address");
        let transactionOutput2 = new TransactionOutput("ID", 100, "address2");
        expect(transactionOutput1.equals(transactionOutput2)).toBe(false);
    });

    it('should return false for different ids', () => {
        let transactionOutput1 = new TransactionOutput("ID", 100, "address");
        let transactionOutput2 = new TransactionOutput("ID2", 100, "address");
        expect(transactionOutput1.equals(transactionOutput2)).toBe(false);
    });

    it('should return false for different amounts', () => {
        let transactionOutput1 = new TransactionOutput("ID", 100, "address");
        let transactionOutput2 = new TransactionOutput("ID", 200, "address");
        expect(transactionOutput1.equals(transactionOutput2)).toBe(false);
    });

    // TempBlocked is not checked in equals method that's why it should return true
    it('should return true for different tempBlocked', () => {
        let transactionOutput1 = new TransactionOutput("ID", 100, "address");
        let transactionOutput2 = new TransactionOutput("ID", 100, "address");
        transactionOutput2.tempBlocked = true;
        expect(transactionOutput1.equals(transactionOutput2)).toBe(true);
    });
});
