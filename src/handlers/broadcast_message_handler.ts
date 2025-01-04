import {Block} from "../block";
import {Node} from "../nodes/node";
import {blockchain, listToMine} from "../index";
import {Transaction} from "../transactions/transaction";


function handleBlockMessage(message: string, node: Node): void { //TODO: Stop mining when valid block is received
    const block: Block = Block.fromJson(JSON.parse(message));
    blockchain.addBlock(block);
    block.getData.getTransactions().forEach(transaction => {
        listToMine.removeItemFromMine(transaction);
    });
    //TODO: Zaktualizować, by działało dla transakcji
}

function handleTextMessage(message: string): void {
    // listToMine.addItemToMine(message);
}

function handleTransactionMessage(message: any): void {
    // // TODO: jakieś weryfikacje? ofc weryfikacja
    console.log('plain message: \n', message);
    listToMine.addItemToMine(Transaction.recreateTransactionJson(message));
}



export { handleBlockMessage, handleTransactionMessage, handleTextMessage };