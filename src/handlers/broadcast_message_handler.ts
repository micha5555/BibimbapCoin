import {Block} from "../block";
import {Node} from "../node";
import {listToMine} from "../index";

const MessageType = Object.freeze({
    BLOCK: 'block',
    TEXT: 'text',
    TRANSACTION: 'transaction'
});


function handleBlockMessage(message: string, node: Node): void {
    const block: Block = Block.fromJson(JSON.parse(message));
    for (let i = 0; i < node.getBlocks.length; i++) {
        if (node.getBlocks[i].getHash == block.getHash) {
            return;
        }
    }
    node.addBlock(block);
}

function handleTextMessage(message: string): void {
    listToMine.addItemToMine(message);
}

function handleTransactionMessage(message: string, node: Node): void {

}



export { MessageType, handleBlockMessage, handleTransactionMessage, handleTextMessage };