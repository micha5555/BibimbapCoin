import { Block } from "./block";
import { ListToMine } from "./list_to_mine";
import inquirer from "inquirer";
import {Node} from "./node";
import {Message, MessageType} from "./message";

export class Miner {
    public TIME_TO_MINE : number = 10000;
    public REGULATION_AFTER_BLOCKS : number = 5;

    private listToMine: ListToMine;
    private identity: string = "";
    private difficulty: number = 6;
    private run = true;
    private node: Node;

    constructor(listToMine: ListToMine, node: Node) {
        this.listToMine = listToMine;
        this.node = node;
    }

    prepareBlockToMine(): Block {
        console.log("Preparing block to mine");
        if(this.node.getBlocks.length % this.REGULATION_AFTER_BLOCKS === 0) {
            //calc time - average time between timestamp and starttimestamp
            let timeSpent = this.node.getBlocks.map(block =>
            {
                let startTime = block.getStartTimestamp().getTime();
                let endTime = block.getTimestamp()?.getTime();
                let index = block.getIndex;
                // genesis block
                if(index === 0)
                    return 0;
                if(endTime === undefined)
                    throw new Error("Block has no timestamp");

                return endTime - startTime
            }).reduce((a, b) => a + b, 0);
            let averageTime = timeSpent / this.REGULATION_AFTER_BLOCKS;
            if(averageTime > this.TIME_TO_MINE * 2) {
                this.difficulty--;
                console.log("Decreasing difficulty to: " + this.difficulty);
            }
            else if(averageTime < this.TIME_TO_MINE / 2) {
                this.difficulty++;
                console.log("Increasing difficulty to: " + this.difficulty);
            }
        }
        let lastBlock = this.node.getBlocks[this.node.getBlocks.length - 1];
        return Block.generate(lastBlock.getIndex+1, lastBlock.getDisplayHash(), new Date(), this.listToMine.getBlockToMine(), this.identity, this.difficulty);
    }

    setIdentity(identity: string) {
        this.identity = identity;
    }

    // TODO: przerwać kopanie aktualnego bloku jak przyjdzie wykopany
    async mineBlock(): Promise<Block> {
        let block = this.prepareBlockToMine();
        console.log("Mining the block");
        block.calculateHash();
        console.log("Current hash: " + block.getDisplayHash() + " with nonce: " + block.getNonce);
        while (!block.isFound(this.difficulty) && this.run) {
            block.incrementNonce();
            block.calculateHash();
            if(block.getNonce % 1000000 === 0)
                console.log("Current hash: " + block.getDisplayHash() + " with nonce: " + block.getNonce);
            // await new Promise(resolve => setTimeout(resolve, 500));  // Adding delay to slow down mining loop
        }
        console.log("Block mined with hash: " + block.getDisplayHash() + " and nonce: " + block.getNonce);
        block.setTimestamp(new Date());
        this.node.addBlock(block);
        let message = Message.newMessage(block.toJson(), MessageType.BLOCK);
        this.node.broadcastMessage(message);
        return block;
    }

    async mine(): Promise<void> {
        this.run = true;

        while (this.run) {

            while(this.listToMine.isEmpty()) {
                console.log("\nNo blocks to mine. Waiting for new blocks...");
                const prompt2 = inquirer.prompt(
                    {
                        type: "confirm",
                        name: "leave",
                        message: "Do you want to leave?",
                        default: false
                    }
                );

                const defaultValue2 = new Promise(resolve => {
                    setTimeout(() => {
                        resolve({leave: false});
                        prompt2.ui.close();
                    }, 2000);
                });

                const answers: any = await Promise.race([defaultValue2, prompt2])

                if (answers.leave) {
                    return
                }
            }

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
