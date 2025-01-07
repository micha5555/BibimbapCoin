import {Block} from "../block";
import {Node} from "../nodes/node";
import {blockchain, listToMine} from "../index";
import {Transaction} from "../transactions/transaction";
import {type} from "node:os";


function handleBlockMessage(message: string, node: Node): void { //TODO: Stop mining when valid block is received
    const block: Block = Block.fromJson(JSON.parse(message));

    //TODO: Jeśli Index większy niż nasz blockchain, prosimy sąsiadów o przesłanie blockchaina (prawdopodobnie wycinka)
    if (block.getIndex > blockchain.getLastBlock().getIndex) {

    }

    blockchain.addBlock(block);
    block.getData.getTransactions().forEach(transaction => {
        listToMine.removeTransactionFromQueue(transaction);
    });

    //TODO: Zaktualizować, by działało dla transakcji
}

function handleTextMessage(message: string): void {
    // listToMine.addItemToMine(message);
}

function handleTransactionMessage(message: any): void {
    // // TODO: jakieś weryfikacje? ofc weryfikacja
    listToMine.addTransactionToQueue(Transaction.recreateTransactionJson(message));
}



export { handleBlockMessage, handleTransactionMessage, handleTextMessage };