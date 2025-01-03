import {TransactionInput} from "../src/transactions/transaction_input";

describe('TransactionInput.constructor', () => {
    it('should be created with correct values', () => {
        let transactionInput = new TransactionInput("ID", 0, 3, "address");
        expect(transactionInput.transactionOutputId).toBe("ID");
        expect(transactionInput.transactionIndex).toBe(0);
        expect(transactionInput.blockIndex).toBe(3);
        expect(transactionInput.address).toBe("address");
    });
});

describe('TransactionInput.calculateHash', () => {
    it('should return a hash', () => {
        let transactionInput = new TransactionInput("ID", 0, 3, "address");
        let hash = transactionInput.calculateHash();
        expect(hash).not.toBe("");
        expect(hash).not.toBeUndefined();
        expect(hash).toBe("0dea53f7f5db9d38791ccede40569f7c0cfac343d9745804a427588797c2652a");
    });

    it('should return a different hash for different values', () => {
        let transactionInput1 = new TransactionInput("ID", 0, 3, "address");
        let transactionInput2 = new TransactionInput("ID", 3, 0, "address");
        let hash1 = transactionInput1.calculateHash();
        let hash2 = transactionInput2.calculateHash();
        expect(hash1).not.toBe(hash2);
    });

    it('should return the same hash for the same values', () => {
        let transactionInput1 = new TransactionInput("ID", 0, 3, "address");
        let transactionInput2 = new TransactionInput("ID", 0, 3, "address");
        let hash1 = transactionInput1.calculateHash();
        let hash2 = transactionInput2.calculateHash();
        expect(hash1).toBe(hash2);
    });
});

describe('TransactionInput.toJson', () => {
    it('should return a JSON object', () => {
        let transactionInput = new TransactionInput("ID", 0, 3, "address");
        let json = transactionInput.toJson();
        expect(json).toBe('{"transactionOutputId":"ID","transactionIndex":0,"blockIndex":3}');
    });
});

describe('TransactionInput.fromJson', () => {
    it('should return a TransactionInput object', () => {
        let json = JSON.stringify({transactionOutputId: "ID", transactionIndex: 0, blockIndex: 3});
        let transactionInput = TransactionInput.fromJson(json);
        expect(transactionInput.transactionOutputId).toBe("ID");
        expect(transactionInput.transactionIndex).toBe(0);
        expect(transactionInput.blockIndex).toBe(3);
    });
});