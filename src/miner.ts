import { Block } from "./block";
import { TransactionQueueToMine } from "./transaction_queue_to_mine";
import inquirer from "inquirer";
import {Node} from "./nodes/node";
import {Message, MessageType} from "./message";
import {blockchain} from "./index";
import {TransactionContainer} from "./transactions/transaction_container";

export class Miner {
    private listToMine: TransactionQueueToMine;
    private identity: string = "";
    private run = true;
    private node: Node;

    constructor(listToMine: TransactionQueueToMine, node: Node) {
        this.listToMine = listToMine;
        this.node = node;
    }

    prepareBlockToMine(): Block {
        let lastBlock = blockchain.getLastBlock();
        let transactionsToMine = this.listToMine.getTransactionsToMine();
        if(transactionsToMine == undefined)
        {
            throw new Error("Transactions to mine is undefined");
        }
        let transactionContainer = new TransactionContainer(transactionsToMine)
        return Block.generate(lastBlock.getIndex+1, lastBlock.getDisplayHash(), new Date(), transactionContainer, this.identity, blockchain.nextBlockDifficulty);
    }

    setIdentity(identity: string) {
        this.identity = identity;
    }

    // TODO: przerwać kopanie aktualnego bloku jak przyjdzie wykopany
    async mineBlock(): Promise<Block> {
        console.log("Preparing block to mine");
        let block = this.prepareBlockToMine();

        console.log("Mining the block");
        block.calculateHash();

        console.log("Current hash: " + block.getDisplayHash() + " with nonce: " + block.getNonce);
        while (!block.isFound() && this.run) {
            block.incrementNonce();
            block.calculateHash();
            if(block.getNonce % 1000000 === 0)
                console.log("Current hash: " + block.getDisplayHash() + " with nonce: " + block.getNonce);
            // await new Promise(resolve => setTimeout(resolve, 500));  // Adding delay to slow down mining loop
        }

        console.log("Block mined with hash: " + block.getDisplayHash() + " and nonce: " + block.getNonce);
        block.setTimestamp(new Date());

        blockchain.addBlock(block);
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
