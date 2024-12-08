import {Block} from "../block";
import {Node} from "../node";
import {listToMine} from "../index";

const MessageType = Object.freeze({
    BLOCK: 'block',
    TEXT: 'text',
    TRANSACTION: 'transaction'
});

//TODO: Genesis Block
//TODO: Walidacja bloku - sprawdzanie trudności

function handleBlockMessage(message: string, node: Node): void { //TODO: Stop mining when valid block is received
    const block: Block = Block.fromJson(JSON.parse(message));
    const sentHash = block.getDisplayHash();
    block.calculateHash();
    if(sentHash != block.getDisplayHash()) {
        console.error("Hashes are not equal");
        return;
    }
    const lastBlock = node.getLastBlock();
    if(lastBlock != undefined) {
        const maxIndexOfBlockFromNode = lastBlock.getIndex;
        if(maxIndexOfBlockFromNode + 1 != block.getIndex) {
            console.error("Block index is not correct. Expected: " + (maxIndexOfBlockFromNode + 1) + " but got: " + block.getIndex);
            return;
        }
        if(lastBlock.getDisplayHash() != block.getPreviousHash) {
            console.error("Previous hash is not correct. Expected: " + lastBlock.getDisplayHash() + " but got: " + block.getPreviousHash);
            return;
        }
    }

    for (let i = 0; i < node.getBlocks.length; i++) {
        if (node.getBlocks[i].getHash == block.getHash) {
            return;
        }
    }
    node.addBlock(block);
    listToMine.removeItemFromMine(block.getData);
}

function handleTextMessage(message: string): void {
    listToMine.addItemToMine(message);
}

function handleTransactionMessage(message: string, node: Node): void {

}



export { MessageType, handleBlockMessage, handleTransactionMessage, handleTextMessage };