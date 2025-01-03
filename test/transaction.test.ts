import {Transaction} from "../src/transactions/transaction";
import {TransactionInput} from "../src/transactions/transaction_input";
import {TransactionOutput} from "../src/transactions/transaction_output";
import {expect} from "@jest/globals";
import 'reflect-metadata';

describe("Transaction.toJsonString", () => {
    it("should return a JSON string", () => {
        let transaction = new Transaction([], [], new Date("2024-07-01T00:00:00.000Z"), "", "");
        let json = transaction.toJsonString();
        expect(json).toBe('{"inputTransactions":[],"outputTransactions":[],"timestamp":"2024-07-01T00:00:00.000Z","publicKey":"","transactionSignature":""}');
    });

    it("should return a JSON string with input transactions", () => {
        let transaction = new Transaction([new TransactionInput("ID", 0, 3, "address")], [], new Date("2024-07-01T00:00:00.000Z"), "", "");
        let json = transaction.toJsonString();
        expect(json).toBe('{"inputTransactions":[{"transactionOutputId":"ID","transactionIndex":0,"blockIndex":3}],"outputTransactions":[],"timestamp":"2024-07-01T00:00:00.000Z","publicKey":"","transactionSignature":""}');
    });

    it("should return a JSON string with output transactions", () => {
        let transaction = new Transaction([], [new TransactionOutput("ID", 100, "address")], new Date("2024-07-01T00:00:00.000Z"), "", "");
        let json = transaction.toJsonString();
        expect(json).toBe('{"inputTransactions":[],"outputTransactions":[{"id":"ID","address":"address","amount":100}],"timestamp":"2024-07-01T00:00:00.000Z","publicKey":"","transactionSignature":""}');
    });

    it("should return a JSON string with input and output transactions", () => {
        let transaction = new Transaction([new TransactionInput("ID", 0, 3, "address")], [new TransactionOutput("ID", 100, "address")], new Date("2024-07-01T00:00:00.000Z"), "", "");
        let json = transaction.toJsonString();
        expect(json).toBe('{"inputTransactions":[{"transactionOutputId":"ID","transactionIndex":0,"blockIndex":3}],"outputTransactions":[{"id":"ID","address":"address","amount":100}],"timestamp":"2024-07-01T00:00:00.000Z","publicKey":"","transactionSignature":""}');
    });
});

describe("Transaction.recreateTransactionJson", () => {
    it("should return a Transaction object", () => {
        let json = '{' +
            '"inputTransactions":[' +
                '{"transactionOutputId":"ID","transactionIndex":0,"blockIndex":3}' +
            '],' +
            '"outputTransactions":[' +
                '{"id":"ID","address":"address","amount":100}' +
            '],' +
            '"timestamp":"2024-07-01T00:00:00.000Z",' +
            '"publicKey":"KEYKEYKEY",' +
            '"transactionSignature":"SIGNATURE"' +
        '}';

        let transaction = Transaction.recreateTransactionJson(json);

        expect(transaction.inputTransactions.length).toBe(1);
        expect(transaction.inputTransactions[0]).toBeInstanceOf(TransactionInput);
        expect(transaction.inputTransactions[0].transactionOutputId).toBe("ID");
        expect(transaction.inputTransactions[0].transactionIndex).toBe(0);
        expect(transaction.inputTransactions[0].blockIndex).toBe(3);
        expect(transaction.outputTransactions.length).toBe(1);
        expect(transaction.outputTransactions[0]).toBeInstanceOf(TransactionOutput);
        expect(transaction.outputTransactions[0].id).toBe("ID");
        expect(transaction.outputTransactions[0].amount).toBe(100);
        expect(transaction.outputTransactions[0].address).toBe("address");
        expect(transaction.timestamp).toBeInstanceOf(Date);
        expect(transaction.timestamp).toEqual(new Date("2024-07-01T00:00:00.000Z"));
        expect(transaction.publicKey).toBe("KEYKEYKEY");
        expect(transaction.transactionSignature).toBe("SIGNATURE");
        expect(transaction).toBeInstanceOf(Transaction);
    });
});