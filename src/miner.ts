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
    // private lastBlockFromBlockchainWhenPreparingBlock: Block | undefined = undefined;

    // variable used to stopping mining current block because someone else already mined it
    // public stopMiningGivenBlock: boolean = false;

    constructor(listToMine: TransactionQueueToMine, node: Node) {
        this.listToMine = listToMine;
        this.node = node;
    }

    prepareBlockToMine(): Block {
        let lastBlock = blockchain.getLastBlock();
        let transactionsToMine = this.listToMine.getTransactionsToMine();
        // this.lastBlockFromBlockchainWhenPreparingBlock = lastBlock;
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
    async mineBlock(): Promise<Block | undefined> {
        console.log("Preparing block to mine");
        let block = this.prepareBlockToMine();

        console.log("Mining the block");
        block.calculateHash();

        console.log("Current hash: " + block.getDisplayHash() + " with nonce: " + block.getNonce);
        while (!block.isFound() && this.run) {
            if(blockchain.getLastCheckedBlockIndex() === block.getIndex) {
                console.log("Block already mined by someone else");
                return undefined;
            }
            block.incrementNonce();
            block.calculateHash();
            //  XDDDDDDDDDDDD
            // tu był taki problem, że jak się koapło długo, to broadcast wywalał się, a z tym działa
            // niby jest coś takiego, że Node działa na jednym wątku z kopaniem i jest zamknięty na jakieś eventy i one wywalają
            if (block.getNonce % 100000 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
            if(block.getNonce % 1000000 === 0)
                console.log("Current hash: " + block.getDisplayHash() + " with nonce: " + block.getNonce);
        }

        console.log("Block mined with hash: " + block.getDisplayHash() + " and nonce: " + block.getNonce);
        block.setTimestamp(new Date());

        // wait random time between 0 and 5 seconds

        blockchain.addBlock(block);
        await new Promise(resolve => setTimeout(resolve, Math.random() * 5000));
        let message = Message.newMessage(block.toJson(), MessageType.BLOCK);
        await this.node.broadcastMessage(message);

        // let blockchainToSend = JSON.stringify(blockchain.getBlocks.map(block => block.toJson()));
        // console.log("blockchainToSend: \n" + blockchainToSend);
        // let messageBlockchain = Message.newMessage(, MessageType.BLOCKCHAIN);
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
            if(block === undefined) {
                console.log("Mining stopped - block already mined by someone else");
                continue;
            } else {
                console.log("Block mined: " + block.toString());
            }

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

    // async stopMiningBlock(): Promise<void> {
    //     if(this.run) {
    //         this.stopMiningGivenBlock = true;
    //     }
    // }
}
