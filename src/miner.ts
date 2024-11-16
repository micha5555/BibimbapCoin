import { Block } from "./block";
import { ListToMine } from "./list_to_mine";
import readline from "readline";

export class Miner {
    private listToMine: ListToMine;
    private difficulty: number = 4;
    private run = true;

    constructor(listToMine: ListToMine) {
        this.listToMine = listToMine;
    }

    prepareBlockToMine(data: string): Block {
        console.log("Preparing block to mine");
        return new Block(0, "0", new Date(), data, "0", 0, "0");         //TODO: Change index data inside block
    }

    async mineBlock(): Promise<Block> {
        let block = this.prepareBlockToMine(this.listToMine.getBlockToMine());
        console.log("Mining the block");
        block.calculateHash();
        console.log("Current hash: " + block.getHash + " with nonce: " + block.getNonce);
        while (!block.isFound(this.difficulty) && this.run) {
            block.incrementNonce();
            block.calculateHash();
            if(block.getNonce % 1000000 === 0)
                console.log("Current hash: " + block.getHash + " with nonce: " + block.getNonce);
            // await new Promise(resolve => setTimeout(resolve, 500));  // Adding delay to slow down mining loop
        }

        console.log("Block mined with hash: " + block.getHash + " and nonce: " + block.getNonce);
        block.setTimestamp = new Date();
        return block;
    }

    async mine(): Promise<void> {
        this.run = true;

        while (this.run) {
            let block = await this.mineBlock();
            console.log("Block mined: " + block.toString());
        }
    }
}
