import { Block } from "./block";
import { ListToMine } from "./list_to_mine";
import inquirer from "inquirer";
import {Node} from "./node";

export class Miner {
    private listToMine: ListToMine;
    private identity: string = "";
    private difficulty: number = 4;
    private run = true;
    private node: Node;

    constructor(listToMine: ListToMine, node: Node) {
        this.listToMine = listToMine;
        this.node = node;
    }

    prepareBlockToMine(): Block {
        console.log("Preparing block to mine");
        if(this.node.getBlocks.length === 0) {
            return Block.generate(0, "" , new Date(), this.listToMine.getBlockToMine(), this.identity);
        }
        let lastBlock = this.node.getBlocks[this.node.getBlocks.length - 1];
        return Block.generate(lastBlock.getIndex+1, lastBlock.getHash, new Date(), this.listToMine.getBlockToMine(), this.identity);
    }

    setIdentity(identity: string) {
        this.identity = identity;
    }

    async mineBlock(): Promise<Block> {
        let block = this.prepareBlockToMine();
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
        block.setTimestamp(new Date());
        //TODO: Add block to blocks
        return block;
    }

    async mine(): Promise<void> {
        this.run = true;

        while (this.run) {
            let block = await this.mineBlock();
            console.log("Block mined: " + block.toString());

            const prompt = inquirer.prompt(
                {
                    type: "confirm",
                    name: "mineAnother",
                    message: "Mine another block?",
                    default: true
                }
            );

            const defaultValue = new Promise(resolve => {
                setTimeout(() => {
                    resolve({mineAnother: true});
                    prompt.ui.close();
                }, 2000);
            });

            const answers = await Promise.race([defaultValue, prompt])
            const answer : any = await answers
            if (!answer.mineAnother) {
                this.run = false;
            }
        }
    }
}
