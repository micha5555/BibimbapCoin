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

describe('TransactionInput.equals', () => {
    it('should return true for the same values', () => {
        let transactionInput1 = new TransactionInput("ID", 0, 3, "address");
        let transactionInput2 = new TransactionInput("ID", 0, 3, "address");
        expect(transactionInput1.equals(transactionInput2)).toBe(true);
    });

    it('should return false for different values', () => {
        let transactionInput1 = new TransactionInput("ID", 0, 3, "address");
        let transactionInput2 = new TransactionInput("ID", 3, 0, "address");
        expect(transactionInput1.equals(transactionInput2)).toBe(false);
    });

    it('should return false for different transactionOutputId', () => {
        let transactionInput1 = new TransactionInput("ID", 0, 3, "address");
        let transactionInput2 = new TransactionInput("ID2", 0, 3, "address");
        expect(transactionInput1.equals(transactionInput2)).toBe(false);
    });

    it('should return false for different transactionIndex', () => {
        let transactionInput1 = new TransactionInput("ID", 0, 3, "address");
        let transactionInput2 = new TransactionInput("ID", 3, 3, "address");
        expect(transactionInput1.equals(transactionInput2)).toBe(false);
    });

    it('should return false for different blockIndex', () => {
        let transactionInput1 = new TransactionInput("ID", 0, 3, "address");
        let transactionInput2 = new TransactionInput("ID", 0, 0, "address");
        expect(transactionInput1.equals(transactionInput2)).toBe(false);
    });

    // Address is not used in the equals method that's why it should return true
    it('should return true for different address', () => {
        let transactionInput1 = new TransactionInput("ID", 0, 3, "address");
        let transactionInput2 = new TransactionInput("ID", 0, 3, "address2");
        expect(transactionInput1.equals(transactionInput2)).toBe(true);
    });
});