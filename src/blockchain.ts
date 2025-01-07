import {Block} from "./block";
import {OpenTransactions} from "./transactions/transactions_open";

export const DEFAULT_DIFFICULTY: number = 11;
export const BLOCK_GENERATION_INTERVAL: number = 10 * 1000; // 10 seconds
export const DIFFICULTY_ADJUSTMENT_INTERVAL: number = 5;

export class Blockchain {

    public blocks: Block[] = [];
    public lastCheckedBlockIndex: number = -1;
    public nextBlockDifficulty: number = DEFAULT_DIFFICULTY;
    public localOpenTransactions: OpenTransactions;

    constructor(openTransactions: OpenTransactions) {
        this.localOpenTransactions = openTransactions;
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

    async addBlock(block: Block): Promise<boolean> {
        if(!block.verifyNew()) {
            console.log("Block verification failed");
            return false;
        }

        // if(block.getPreviousHash === this.getLastBlock().getDisplayHash()) {
            this.blocks.push(block);
            this.updateOpenTransactions();
            this.adjustDifficulty();
        // }
        // else if (block.getIndex > this.getLastBlock().getIndex) {
        //     console.log("IN ELSE IF");
        //     let neighborsBlockchains = await node.askNeighboursForBlockchain();
        //     let neighborsBlockchainsWithThisBlock = neighborsBlockchains.filter(blockchain => Blockchain.checkIfBlockchainContainsBlock(block, blockchain));
        //     let longestBlockchainThatIsValid: Blockchain | undefined = undefined;
        //     for (const blockchain of neighborsBlockchainsWithThisBlock) {
        //         if (blockchain.verifyBlockchain()) {
        //             if (longestBlockchainThatIsValid === undefined || blockchain.getBlocks.length > longestBlockchainThatIsValid.getBlocks.length) {
        //                 longestBlockchainThatIsValid = blockchain;
        //             }
        //         }
        //     }
        //     if (longestBlockchainThatIsValid !== undefined) {
        //         // for(let block of longestBlockchainThatIsValid.getBlocks) {
        //         //     this.blocks.push(block);
        //         //     this.updateOpenTransactions();
        //         //     // this.adjustDifficulty();
        //         // }
        //         this.blocks = longestBlockchainThatIsValid.getBlocks;
        //         this.lastCheckedBlockIndex = longestBlockchainThatIsValid.getLastCheckedBlockIndex();
        //         this.nextBlockDifficulty = longestBlockchainThatIsValid.nextBlockDifficulty;
        //     }
        // }

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

    loadFromJsonWithUpdatingOpenTransactions(json: string) {
        let jsonBlocks = JSON.parse(json).blocks;
        for (let jsonBlock of jsonBlocks) {
            this.blocks.push(Block.fromJson(JSON.stringify(jsonBlock)));
        }

        if (this.getLastBlock().getIndex > this.lastCheckedBlockIndex) {
            this.updateOpenTransactions();
        }
    }

    loadFromJson(json:any) {
        for (let jsonBlock of json) {
            this.blocks.push(Block.fromJson(JSON.stringify(jsonBlock)));
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
                    this.localOpenTransactions.addTransaction(outputTransaction, i, block.getIndex);
                }

                for (let inputTransaction of transaction.inputTransactions) {
                    this.localOpenTransactions.removeTransactionById(inputTransaction.transactionOutputId);
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
        let copy = new Blockchain(this.localOpenTransactions.createCopy());
        copy.blocks = this.blocks.slice();
        copy.lastCheckedBlockIndex = this.lastCheckedBlockIndex;
        copy.nextBlockDifficulty = this.nextBlockDifficulty;
        return copy
    }

    replaceBlockchain(newBlockchain: Blockchain) {
        this.blocks = newBlockchain.blocks;
        this.lastCheckedBlockIndex = newBlockchain.lastCheckedBlockIndex;
        this.nextBlockDifficulty = newBlockchain.nextBlockDifficulty;
        this.localOpenTransactions = newBlockchain.localOpenTransactions;
    }

    removeLastBlock() { // Orphan block handling
        if (this.blocks.length === 1) {
            console.log("Cannot remove genesis block");
            return;
        }

        // Get last block and remove it from blockchain
        let lastBlock = this.blocks.pop();
        if (lastBlock === undefined) {
            console.log("Error while removing last block");
            return;
        }

        let transactions = lastBlock.getData.getTransactions();

        // For each transaction
        for (let i = 0; i < transactions.length; i++) {
            let transaction = transactions[i];

            // Handle output transactions
            for (let outputTransaction of transaction.outputTransactions) {

                // Remove outputTransactions of this block (aka open) from open transactions
                let deleted = this.localOpenTransactions.removeTransactionById(outputTransaction.id);
                if (!deleted) {
                    throw new Error("Error while removing transaction from open transactions: " + outputTransaction.id + " " + outputTransaction.address + " " + i + " " + lastBlock.getIndex);
                }
            }

            // Handle input transactions
            for (let inputTransaction of transaction.inputTransactions) {
                //Get output transaction that input transaction is referring to
                let block = this.blocks[inputTransaction.blockIndex];
                let transaction = block.getData.getTransaction(inputTransaction.transactionIndex)
                if(transaction === undefined) {
                    throw new Error("Transaction not found");
                }
                let outputTransaction = transaction.outputTransactions.find(outputTransaction => outputTransaction.id === inputTransaction.transactionOutputId);
                if(outputTransaction === undefined) {
                    throw new Error("Output transaction not found");
                }

                // Verify if the address matches the public key
                if(outputTransaction.address !== transaction.publicKey) {
                    throw new Error("Address does not match public key");
                }

                // Add output transaction back to open transactions
                this.localOpenTransactions.addTransaction(outputTransaction, inputTransaction.transactionIndex, inputTransaction.blockIndex);
            }
        }

        // Update last checked block index
        this.lastCheckedBlockIndex--;
        this.nextBlockDifficulty = lastBlock.difficulty;
    }

    // TODO: implement to twoje Jakubie
    verifyBlockchain(): boolean {
        return true;
    }

    static checkIfBlockchainContainsBlock(block: Block, blockchain: Blockchain): boolean {
        for (let blockFromBlockchain of blockchain.getBlocks) {
            if (blockFromBlockchain.getHash === block.getHash) {
                return true;
            }
        }
        return false;
    }
}