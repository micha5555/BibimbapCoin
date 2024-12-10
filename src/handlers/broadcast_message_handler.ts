import {Block} from "../block";
import {Node} from "../node";
import {blockchain, listToMine} from "../index";

//TODO: Walidacja bloku - sprawdzanie trudności

function handleBlockMessage(message: string, node: Node): void { //TODO: Stop mining when valid block is received
    const block: Block = Block.fromJson(JSON.parse(message));
    const sentHash = block.getDisplayHash();
    block.calculateHash();
    if(sentHash != block.getDisplayHash()) {
        console.error("Hashes are not equal");
        return;
    }
    //TODO: Sprawdzić co stąd powinno wylądać po stronie odpowiedzialności blockchaina (chyba cała walidacja?)

    const lastBlock = blockchain.getLastBlock();
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

    for (let i = 0; i < blockchain.getBlocks.length; i++) {
        if (blockchain.getBlock(i).getHash == block.getHash) {
            return;
        }
    }
    blockchain.addBlock(block);
    listToMine.removeItemFromMine(block.getData);
}

function handleTextMessage(message: string): void {
    listToMine.addItemToMine(message);
}

function handleTransactionMessage(message: string, node: Node): void {

}



export { handleBlockMessage, handleTransactionMessage, handleTextMessage };