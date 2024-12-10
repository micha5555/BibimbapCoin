import {Block} from "../block";
import {Node} from "../node";
import {blockchain, listToMine} from "../index";


function handleBlockMessage(message: string, node: Node): void { //TODO: Stop mining when valid block is received
    const block: Block = Block.fromJson(JSON.parse(message));
    blockchain.addBlock(block);
    listToMine.removeItemFromMine(block.getData); //TODO: Zaktualizować, by działało dla transakcji
}

function handleTextMessage(message: string): void {
    listToMine.addItemToMine(message);
}

function handleTransactionMessage(message: string, node: Node): void {

}



export { handleBlockMessage, handleTransactionMessage, handleTextMessage };