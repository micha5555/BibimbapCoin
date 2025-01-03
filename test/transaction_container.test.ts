import {TransactionContainer} from "../src/transactions/transaction_container";
import {Transaction} from "../src/transactions/transaction";
import {TransactionInput} from "../src/transactions/transaction_input";
import {TransactionOutput} from "../src/transactions/transaction_output";

describe("TransactionContainer.toJsonString", () => {
    it("should return an empty transactions JSON string", () => {
        let transactionContainer = new TransactionContainer();
        let json = transactionContainer.toJsonString();
        expect(json).toBe('{"transactions":[]}');
    });

    it("should return a JSON string with one transaction", () => {
        let inputTransactions = [new TransactionInput("ID", 0, 3, "address")];
        let outputTransactions = [new TransactionOutput("ID", 100, "address")];
        let transaction = new Transaction(inputTransactions, outputTransactions, new Date("2024-07-01T00:00:00.000Z"), "KEYPUBLICKEYKEY_KEY", "SIGNATURE_SIGNATURE");
        let transactionContainer = new TransactionContainer([transaction]);
        let json = transactionContainer.toJsonString();

        let expectedJson = '{"transactions":' +
            '[' +
                '{' +
                    '"inputTransactions":[{"transactionOutputId":"ID","transactionIndex":0,"blockIndex":3}],' +
                    '"outputTransactions":[{"id":"ID","address":"address","amount":100}],' +
                    '"timestamp":"2024-07-01T00:00:00.000Z",' +
                    '"publicKey":"KEYPUBLICKEYKEY_KEY",' +
                    '"transactionSignature":"SIGNATURE_SIGNATURE"' +
                '}' +
            ']' +
        '}';

        expect(json).toBe(expectedJson);
    });

    it("should return a JSON string with multiple transactions", () => {
        let inputTransactions1 = [new TransactionInput("ID1", 0, 5, "address11")];
        let outputTransactions1 = [new TransactionOutput("ID1", 100, "address12")];
        let transaction1 = new Transaction(inputTransactions1, outputTransactions1, new Date("2024-07-01T00:00:00.000Z"), "KEYPUBLICKEYKEY_KEY", "SIGNATURE_SIGNATURE");

        let inputTransactions2 = new TransactionInput("ID2", 1, 7, "address21");
        let outputTransactions2 = new TransactionOutput("ID2", 10, "address22");

        let inputTransactions3 = new TransactionInput("ID3", 2, 3, "address31");
        let outputTransactions3 = new TransactionOutput("ID3", 1020, "address32");

        let transaction2 = new Transaction(
            [inputTransactions2, inputTransactions3],
            [outputTransactions2,outputTransactions3],
            new Date("2024-07-01T00:00:00.000Z"),
            "KEYPUBLICKEYKEY_KEY",
            "SIGNATURE_SIGNATURE");

        let transactionContainer = new TransactionContainer([transaction1, transaction2]);
        let json = transactionContainer.toJsonString();

        let expectedJson = '{"transactions":' +
            '[' +
                '{' +
                    '"inputTransactions":[{"transactionOutputId":"ID1","transactionIndex":0,"blockIndex":5}],' +
                    '"outputTransactions":[{"id":"ID1","address":"address12","amount":100}],' +
                    '"timestamp":"2024-07-01T00:00:00.000Z",' +
                    '"publicKey":"KEYPUBLICKEYKEY_KEY",' +
                    '"transactionSignature":"SIGNATURE_SIGNATURE"' +
                '},' +
                '{' +
                    '"inputTransactions":[' +
                        '{"transactionOutputId":"ID2","transactionIndex":1,"blockIndex":7},' +
                        '{"transactionOutputId":"ID3","transactionIndex":2,"blockIndex":3}' +
                    '],' +
                    '"outputTransactions":[' +
                        '{"id":"ID2","address":"address22","amount":10},' +
                        '{"id":"ID3","address":"address32","amount":1020}' +
                    '],' +
                    '"timestamp":"2024-07-01T00:00:00.000Z",' +
                    '"publicKey":"KEYPUBLICKEYKEY_KEY",' +
                    '"transactionSignature":"SIGNATURE_SIGNATURE"' +
                '}' +
            ']' +
        '}';

        expect(json).toBe(expectedJson);
    });
});