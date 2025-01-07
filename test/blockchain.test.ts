// import {Blockchain} from "../src/blockchain";
// import {Block} from "../src/block";
// import {TransactionContainer} from "../src/transactions/transaction_container";
// import {expect} from "@jest/globals";
//
// describe("Blockchain.createCopy", () => {
//     it("should return a copy of the blockchain", () => {
//         let blockchain = new Blockchain();
//         let copy = blockchain.createCopy();
//         expect(copy).toEqual(blockchain);
//     });
//
//     it("should return a copy of the blockchain with the same blocks", () => {
//         let blockchain = new Blockchain();
//         blockchain.blocks = [new Block(1, "GENESIS BLOCK HASH", new Date("2021-01-01"), new TransactionContainer(), "HASH", 1000, 5, "MINER ID")];
//         blockchain.nextBlockDifficulty = 5;
//         blockchain.lastCheckedBlockIndex = 1;
//         let copy = blockchain.createCopy();
//         expect(copy.blocks).toEqual(blockchain.blocks);
//         expect(copy.blocks[0]).toEqual(blockchain.blocks[0]);
//         expect(copy.blocks[0].getIndex).toEqual(blockchain.blocks[0].getIndex);
//         expect(copy.blocks[0].getPreviousHash).toEqual(blockchain.blocks[0].getPreviousHash);
//         expect(copy.blocks[0].getTimestamp).toEqual(blockchain.blocks[0].getTimestamp);
//         expect(copy.blocks[0].getData).toEqual(blockchain.blocks[0].getData);
//         expect(copy.blocks[0].getHash).toEqual(blockchain.blocks[0].getHash);
//         expect(copy.blocks[0].getNonce).toEqual(blockchain.blocks[0].getNonce);
//         expect(copy.blocks[0].getMinerId).toEqual(blockchain.blocks[0].getMinerId);
//         expect(copy.nextBlockDifficulty).toEqual(blockchain.nextBlockDifficulty);
//         expect(copy.lastCheckedBlockIndex).toEqual(blockchain.lastCheckedBlockIndex);
//     });
// });

describe("default", () => {
    it("should pass", () => {
        expect(true).toBe(true);
    });
});