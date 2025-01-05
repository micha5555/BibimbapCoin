import {Transaction} from "../src/transactions/transaction";
import {TransactionQueueToMine} from "../src/transaction_queue_to_mine";
import {TransactionInput} from "../src/transactions/transaction_input";
import {TransactionOutput} from "../src/transactions/transaction_output";

describe("TransactionQueueToMine.addTransactionToQueue", () => {
    it("should add a transaction to the queue", () => {
        let transactionQueueToMine = new TransactionQueueToMine();
        let transaction = new Transaction(
            [new TransactionInput("ID", 0, 3, "address")],
            [new TransactionOutput("ID", 100, "address")],
            new Date("2024-07-01T00:00:00.000Z"),
            "KEYKEYKEY",
            "SIGNATURE"
        );

        transactionQueueToMine.addTransactionToQueue(transaction);
        expect(transactionQueueToMine.getQueue.length).toBe(1);
        expect(transactionQueueToMine.getQueue[0]).toBe(transaction);
    });

    it("should add multiple transactions to the queue", () => {
        let transactionQueueToMine = new TransactionQueueToMine();

        let transaction1 = new Transaction(
            [new TransactionInput("ID", 0, 3, "address")],
            [new TransactionOutput("ID", 100, "address")],
            new Date("2024-07-01T00:00:00.000Z"),
            "KEYKEYKEY",
            "SIGNATURE"
        )
        let transaction2 = new Transaction(
            [new TransactionInput("ID2", 1, 3, "address22")],
            [new TransactionOutput("ID2", 130, "address22")],
            new Date("2024-07-01T00:00:00.000Z"),
            "KEYKEYKEY",
            "SIGNATURE"
        );

        transactionQueueToMine.addTransactionToQueue(transaction1);
        transactionQueueToMine.addTransactionToQueue(transaction2);
        expect(transactionQueueToMine.getQueue.length).toBe(2);
        expect(transactionQueueToMine.getQueue[0]).toBe(transaction1);
        expect(transactionQueueToMine.getQueue[1]).toBe(transaction2);
    });
});

describe("TransactionQueueToMine.getTransactionToMine", () => {
    it("should return the first transaction in the queue", () => {
        let transactionQueueToMine = new TransactionQueueToMine();

        let transaction1 = new Transaction(
            [new TransactionInput("ID", 0, 3, "address")],
            [new TransactionOutput("ID", 100, "address")],
            new Date("2024-07-01T00:00:00.000Z"),
            "KEYKEYKEY",
            "SIGNATURE"
        )
        let transaction2 = new Transaction(
            [new TransactionInput("ID2", 1, 3, "address22")],
            [new TransactionOutput("ID2", 130, "address22")],
            new Date("2024-07-01T00:00:00.000Z"),
            "KEYKEYKEY",
            "SIGNATURE"
        );

        transactionQueueToMine.addTransactionToQueue(transaction1);
        transactionQueueToMine.addTransactionToQueue(transaction2);
        expect(transactionQueueToMine.getTransactionToMine()).toBe(transaction1);
        expect(transactionQueueToMine.getQueue.length).toBe(1);
        expect(transactionQueueToMine.getQueue[0]).toBe(transaction2);
    });

    it("should return undefined if the queue is empty", () => {
        let transactionQueueToMine = new TransactionQueueToMine();
        expect(transactionQueueToMine.getTransactionToMine()).toBeUndefined();
    });

    it("should return undefined if the queue is empty after getting the last transaction", () => {
        let transactionQueueToMine = new TransactionQueueToMine();

        let transaction1 = new Transaction(
            [new TransactionInput("ID", 0, 3, "address")],
            [new TransactionOutput("ID", 100, "address")],
            new Date("2024-07-01T00:00:00.000Z"),
            "KEYKEYKEY",
            "SIGNATURE"
        )

        transactionQueueToMine.addTransactionToQueue(transaction1);
        expect(transactionQueueToMine.getTransactionToMine()).toBe(transaction1);
        expect(transactionQueueToMine.getQueue.length).toBe(0);
        expect(transactionQueueToMine.getTransactionToMine()).toBeUndefined();
    });
});

describe("TransactionQueueToMine.isEmpty", () => {
    it("should return true if the queue is empty", () => {
        let transactionQueueToMine = new TransactionQueueToMine();
        expect(transactionQueueToMine.isEmpty()).toBe(true);
    });

    it("should return false if the queue is not empty", () => {
        let transactionQueueToMine = new TransactionQueueToMine();

        let transaction1 = new Transaction(
            [new TransactionInput("ID", 0, 3, "address")],
            [new TransactionOutput("ID", 100, "address")],
            new Date("2024-07-01T00:00:00.000Z"),
            "KEYKEYKEY",
            "SIGNATURE"
        )

        transactionQueueToMine.addTransactionToQueue(transaction1);
        expect(transactionQueueToMine.isEmpty()).toBe(false);
    });
});

describe("TransactionQueueToMine.removeTransactionFromQueue", () => {
   it("should remove a transaction from the queue with the same object", () => {
         let transactionQueueToMine = new TransactionQueueToMine();

         let transaction1 = new Transaction(
              [new TransactionInput("ID", 0, 3, "address")],
              [new TransactionOutput("ID", 100, "address")],
              new Date("2024-07-01T00:00:00.000Z"),
              "KEYKEYKEY",
              "SIGNATURE"
         )
         let transaction2 = new Transaction(
              [new TransactionInput("ID2", 1, 3, "address22")],
              [new TransactionOutput("ID2", 130, "address22")],
              new Date("2024-07-01T00:00:00.000Z"),
              "KEYKEYKEY",
              "SIGNATURE"
         );

         transactionQueueToMine.addTransactionToQueue(transaction1);
         transactionQueueToMine.addTransactionToQueue(transaction2);
         transactionQueueToMine.removeTransactionFromQueue(transaction1);
         expect(transactionQueueToMine.getQueue.length).toBe(1);
         expect(transactionQueueToMine.getQueue[0]).toBe(transaction2);
   });

   it("should remove a transaction from the queue with the same values", () => {
            let transactionQueueToMine = new TransactionQueueToMine();

            let transaction1 = new Transaction(
                [new TransactionInput("ID", 0, 3, "address")],
                [new TransactionOutput("ID", 100, "address")],
                new Date("2024-07-01T00:00:00.000Z"),
                "KEYKEYKEY",
                "SIGNATURE"
            )
            let transaction2 = new Transaction(
                [new TransactionInput("ID", 0, 3, "address")],
                [new TransactionOutput("ID", 100, "address")],
                new Date("2024-07-01T00:00:00.000Z"),
                "KEYKEYKEY",
                "SIGNATURE"
            );

            transactionQueueToMine.addTransactionToQueue(transaction1);
            transactionQueueToMine.removeTransactionFromQueue(transaction2);
            expect(transactionQueueToMine.getQueue.length).toBe(0);
   });
});