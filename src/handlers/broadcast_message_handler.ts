import {Block} from "../block";
import {Node} from "../node";

const MessageType = Object.freeze({
    BLOCK: 'block',
    TRANSACTION: 'transaction',
    PLAIN: 'plain'
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

function handleTransactionMessage(message: string, node: Node): void {

}

function handlePlainMessage(message: string, node: Node): void {

}

export { MessageType, handleBlockMessage, handleTransactionMessage, handlePlainMessage };