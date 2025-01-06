import {Block} from "./block";
import {openTransactions} from "./index";

export const DEFAULT_DIFFICULTY: number = 4;
export const BLOCK_GENERATION_INTERVAL: number = 10 * 1000; // 10 seconds
export const DIFFICULTY_ADJUSTMENT_INTERVAL: number = 5;

export class Blockchain {

    public blocks: Block[] = [];
    private lastCheckedBlockIndex: number = -1;
    public nextBlockDifficulty: number = DEFAULT_DIFFICULTY;

    constructor() {
        this.blocks.push(Block.generateGenesis());
        this.updateOpenTransactions();
    }

    adjustDifficulty() {
        if (this.blocks.length % DIFFICULTY_ADJUSTMENT_INTERVAL !== 0) {
            return;
        }

        let lastBlocks = this.blocks.slice(-DIFFICULTY_ADJUSTMENT_INTERVAL);
        let timeSpent = lastBlocks.map(block => {
            let startTime = block.getStartTimestamp().getTime();
            let endTime = block.getTimestamp()?.getTime();
            let index = block.getIndex;

            if (index === 0) // Genesis block
                return 0;
            if (endTime === undefined)
                throw new Error("Block has no timestamp");

            return endTime - startTime
        }).reduce((a, b) => a + b, 0);

        let averageTime = timeSpent / DIFFICULTY_ADJUSTMENT_INTERVAL;

        if (averageTime > BLOCK_GENERATION_INTERVAL * 2) {
            this.nextBlockDifficulty--;
            // console.log("Decreasing difficulty to: " + this.nextBlockDifficulty);
        } else if (averageTime < BLOCK_GENERATION_INTERVAL / 2) {
            this.nextBlockDifficulty++;
            // console.log("Increasing difficulty to: " + this.nextBlockDifficulty);
        }
    }

    addBlock(block: Block) : boolean {
        block.verifyNew(); //TODO: Weryfikacja na ten moment nie jest do niczego wykorzystywana

        //TODO: If valid - Stop mining current block
        this.blocks.push(block);
        this.updateOpenTransactions();
        this.adjustDifficulty();
        //TODO: NOW - we can start mining again
        return true;
    }

    addBatchOfBlocks(blocks: Block[]) {
        let lastBlockIndex = this.getLastBlock().getIndex;

        for (let block of blocks) {
            if (block.getIndex <= lastBlockIndex) {
                if (!block.verifyExisting()) {
                    console.log("Error while verifying a block that should be already in the blockchain");
                    return;
                }
                //TODO: Add fork handling
            }
            else {
                let success = this.addBlock(block);
                if (!success) {
                    console.log("Error while adding a block");
                    return;
                }
            }
        }
    }

    get getBlocks() {
        return this.blocks;
    }

    getBlock(index: number): Block {
        if(index < 0 || index >= this.blocks.length) {
            throw new Error("Block index out of bounds");
        }
        return this.blocks[index];
    }

    getLastBlock(): Block {
        return this.blocks[this.blocks.length - 1];
    }

    toJson() {
        return JSON.stringify(this);
    }

    loadFromJson(json: string) {
        let jsonBlocks = JSON.parse(json).blocks;
        for (let jsonBlock of jsonBlocks) {
            this.blocks.push(Block.fromJson(jsonBlock));
        }

        if (this.getLastBlock().getIndex > this.lastCheckedBlockIndex) {
            this.updateOpenTransactions();
        }
    }

    updateOpenTransactions() {
        if (this.lastCheckedBlockIndex < this.blocks.length) {
            let block = this.blocks[this.lastCheckedBlockIndex + 1];
            for (let i = 0; i < block.getData.getTransactions().length; i++) {
                let transaction = block.getData.getTransaction(i);
                if(transaction === undefined) {
                    throw new Error("Transaction not found");
                }
                for (let outputTransaction of transaction.outputTransactions) {
                    openTransactions.addTransaction(outputTransaction, i, block.getIndex);
                }

                for (let inputTransaction of transaction.inputTransactions) {
                    openTransactions.removeTransactionById(inputTransaction.transactionOutputId);
                }
            }

            this.lastCheckedBlockIndex++;
        }
    }

    displayBlockChain() {
        for (let block of this.blocks) {
            console.log(block.toString());
        }
    }

    getLastCheckedBlockIndex() {
        return this.lastCheckedBlockIndex;
    }

    createCopy() {
        let copy = new Blockchain();
        copy.blocks = this.blocks.slice();
        copy.lastCheckedBlockIndex = this.lastCheckedBlockIndex;
        copy.nextBlockDifficulty = this.nextBlockDifficulty;
        return copy
    }

    removeLastBlock() { // Orphan block handling
        if (this.blocks.length === 1) {
            console.log("Cannot remove genesis block");
            return;
        }

        let lastBlock = this.blocks.pop();
        if (lastBlock === undefined) {
            console.log("Error while removing last block");
            return;
        }

        let transactions = lastBlock.getData.getTransactions();

        for (let i = 0; i < transactions.length; i++) {
            let transaction = transactions[i];
            for (let outputTransaction of transaction.outputTransactions) {
                // openTransactions.removeTransactionById(outputTransaction.id);
                let deleted = openTransactions.removeTransaction(outputTransaction.id, outputTransaction.address, i, lastBlock.getIndex);
                if (!deleted) {
                    throw new Error("Error while removing transaction from open transactions: " + outputTransaction.id + " " + outputTransaction.address + " " + i + " " + lastBlock.getIndex);
                }
            }

            for (let inputTransaction of transaction.inputTransactions) {
                //Get block with output transaction
                let block = this.blocks[inputTransaction.blockIndex];
                let transaction = block.getData.getTransaction(inputTransaction.transactionIndex)
                if(transaction === undefined) {
                    throw new Error("Transaction not found");
                }
                let outputTransaction = transaction.outputTransactions.find(outputTransaction => outputTransaction.id === inputTransaction.transactionOutputId);
                if(outputTransaction === undefined) {
                    throw new Error("Output transaction not found");
                }

                if(outputTransaction.address !== transaction.publicKey) {
                    throw new Error("Address does not match public key");
                }

                openTransactions.addTransaction(outputTransaction, inputTransaction.transactionIndex, inputTransaction.blockIndex);
            }
        }

        this.lastCheckedBlockIndex--;

    }
}