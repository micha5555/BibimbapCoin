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
            [outputTransactions2, outputTransactions3],
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

describe("TransactionContainer.fromJson", () => {
    it("should return an empty TransactionContainer object", () => {
        let json = '{"transactions":[]}';
        let transactionContainer = TransactionContainer.fromJson(json);
        expect(transactionContainer.getTransactions().length).toBe(0);
        expect(transactionContainer).toBeInstanceOf(TransactionContainer);
    });

    it("should return a TransactionContainer object with multiple transactions", () => {
        let json = '{"transactions":' +
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

        let transactionContainer = TransactionContainer.fromJson(json);

        expect(transactionContainer).toBeInstanceOf(TransactionContainer);

        expect(transactionContainer.getTransactions().length).toBe(2);
        expect(transactionContainer.getTransactions()[0]).toBeInstanceOf(Transaction);

        expect(transactionContainer.getTransactions()[0].inputTransactions.length).toBe(1);
        expect(transactionContainer.getTransactions()[0].inputTransactions[0]).toBeInstanceOf(TransactionInput);
        expect(transactionContainer.getTransactions()[0].inputTransactions[0].transactionOutputId).toBe("ID1");
        expect(transactionContainer.getTransactions()[0].inputTransactions[0].transactionIndex).toBe(0);
        expect(transactionContainer.getTransactions()[0].inputTransactions[0].blockIndex).toBe(5);
        expect(transactionContainer.getTransactions()[0].inputTransactions[0].address).toBe(undefined);

        expect(transactionContainer.getTransactions()[0].outputTransactions.length).toBe(1);
        expect(transactionContainer.getTransactions()[0].outputTransactions[0]).toBeInstanceOf(TransactionOutput);
        expect(transactionContainer.getTransactions()[0].outputTransactions[0].id).toBe("ID1");
        expect(transactionContainer.getTransactions()[0].outputTransactions[0].amount).toBe(100);
        expect(transactionContainer.getTransactions()[0].outputTransactions[0].address).toBe("address12");

        expect(transactionContainer.getTransactions()[0].timestamp).toBeInstanceOf(Date);
        expect(transactionContainer.getTransactions()[0].timestamp).toEqual(new Date("2024-07-01T00:00:00.000Z"));
        expect(transactionContainer.getTransactions()[0].publicKey).toBe("KEYPUBLICKEYKEY_KEY");
        expect(transactionContainer.getTransactions()[0].transactionSignature).toBe("SIGNATURE_SIGNATURE");

        expect(transactionContainer.getTransactions()[1]).toBeInstanceOf(Transaction);

        expect(transactionContainer.getTransactions()[1].inputTransactions.length).toBe(2);
        expect(transactionContainer.getTransactions()[1].inputTransactions[0]).toBeInstanceOf(TransactionInput);
        expect(transactionContainer.getTransactions()[1].inputTransactions[0].transactionOutputId).toBe("ID2");
        expect(transactionContainer.getTransactions()[1].inputTransactions[0].transactionIndex).toBe(1);
        expect(transactionContainer.getTransactions()[1].inputTransactions[0].blockIndex).toBe(7);
        expect(transactionContainer.getTransactions()[1].inputTransactions[0].address).toBe(undefined);
        expect(transactionContainer.getTransactions()[1].inputTransactions[1]).toBeInstanceOf(TransactionInput);
        expect(transactionContainer.getTransactions()[1].inputTransactions[1].transactionOutputId).toBe("ID3");
        expect(transactionContainer.getTransactions()[1].inputTransactions[1].transactionIndex).toBe(2);
        expect(transactionContainer.getTransactions()[1].inputTransactions[1].blockIndex).toBe(3);
        expect(transactionContainer.getTransactions()[1].inputTransactions[1].address).toBe(undefined);

        expect(transactionContainer.getTransactions()[1].outputTransactions.length).toBe(2);
        expect(transactionContainer.getTransactions()[1].outputTransactions[0]).toBeInstanceOf(TransactionOutput);
        expect(transactionContainer.getTransactions()[1].outputTransactions[0].id).toBe("ID2");
        expect(transactionContainer.getTransactions()[1].outputTransactions[0].amount).toBe(10);
        expect(transactionContainer.getTransactions()[1].outputTransactions[0].address).toBe("address22");
        expect(transactionContainer.getTransactions()[1].outputTransactions[1]).toBeInstanceOf(TransactionOutput);
        expect(transactionContainer.getTransactions()[1].outputTransactions[1].id).toBe("ID3");
        expect(transactionContainer.getTransactions()[1].outputTransactions[1].amount).toBe(1020);
        expect(transactionContainer.getTransactions()[1].outputTransactions[1].address).toBe("address32");

        expect(transactionContainer.getTransactions()[1].timestamp).toBeInstanceOf(Date);
        expect(transactionContainer.getTransactions()[1].timestamp).toEqual(new Date("2024-07-01T00:00:00.000Z"));
        expect(transactionContainer.getTransactions()[1].publicKey).toBe("KEYPUBLICKEYKEY_KEY");
        expect(transactionContainer.getTransactions()[1].transactionSignature).toBe("SIGNATURE_SIGNATURE");

    });
});