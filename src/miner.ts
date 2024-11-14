import {Block} from "./block";
import {ListToMine} from "./list_to_mine";

export class Miner {
    private listToMine: ListToMine;

    constructor(listToMine: ListToMine) {
        this.listToMine = listToMine;
    }

    prepareBlockToMine(data: string): Block {
        console.log("Preparing block to mine");
        return new Block(0, "0", new Date(), data, "0", 0, "0");         //TODO: Change index data inside block
    }


    mineBlock(): Block {
        let block = this.prepareBlockToMine(this.listToMine.getBlockToMine());
        console.log("Mining the block");
        block.calculateHash();
        console.log("Current hash: " + block.hash + " with nonce: " + block.nonce);
        while (block.hash.substring(0, 4) !== "0000") {
            block.incrementNonce();
            block.calculateHash();
            console.log("Current hash: " + block.hash + " with nonce: " + block.nonce);
        }

        console.log("Block mined with hash: " + block.hash + " and nonce: " + block.nonce);
        block.timestamp = new Date();
        return block;
    }
}