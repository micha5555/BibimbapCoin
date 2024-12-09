import {Block} from "./block";

export const DEFAULT_DIFFICULTY: number = 4;
export const BLOCK_GENERATION_INTERVAL: number = 10 * 1000; // 10 seconds
export const DIFFICULTY_ADJUSTMENT_INTERVAL: number = 5;

export class Blockchain {

    public blocks: Block[] = [];
    private lastCheckedBlockIndex: number = -1;
    public nextBlockDifficulty: number = DEFAULT_DIFFICULTY;

    constructor() {
        this.generateGenesisBlock();
    }

    adjustDifficulty() {
        if (this.blocks.length % DIFFICULTY_ADJUSTMENT_INTERVAL === 0) {
            //TODO: Implement difficulty adjustment
        }
    }

    private generateGenesisBlock() {
        const dataToHash = "Genesis Block";
        var genesisBlock = new Block(0, "", new Date("2024-12-09T16:01:19.692Z"), dataToHash, "", 0, 0, "");
        genesisBlock.calculateHash();
        return genesisBlock;
    }

    addBlock(block: Block) : boolean {
        //TODO: Validate the block
        //TODO: If valid - Stop mining current block
        this.blocks.push(block);
        //TODO: Update open transactions
        this.adjustDifficulty();

        return true;
    }

    addBatchOfBlocks(blocks: Block[]) {
        for (let block of blocks) {
            let success = this.addBlock(block);
            if (!success) {
                console.log("Error while adding a block");
                return;
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
        while(this.lastCheckedBlockIndex < this.blocks.length) {
            let block = this.blocks[this.lastCheckedBlockIndex + 1];
            for (let transaction of block.getData) { //TODO: Change for transactions

            }
            this.lastCheckedBlockIndex++;
        }
    }
}