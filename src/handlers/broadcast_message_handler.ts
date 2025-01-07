import {Block} from "../block";
import {Node} from "../nodes/node";
import {blockchain, listToMine} from "../index";
import {Transaction} from "../transactions/transaction";
import {type} from "node:os";
import {Blockchain} from "../blockchain";


async function handleBlockMessage(message: string, node: Node): Promise<void> { //TODO: Stop mining when valid block is received
    const block: Block = Block.fromJson(message);

    if(block.getPreviousHash !== blockchain.getLastBlock().getDisplayHash()) {
        //TODO: Jeśli Index większy niż nasz blockchain, prosimy sąsiadów o przesłanie blockchaina (prawdopodobnie wycinka)
        if (block.getIndex > blockchain.getLastBlock().getIndex) {
            console.log("IN handleBlockMessage IF");
            let neighborsBlockchains = await node.askNeighboursForBlockchain();
            let neighborsBlockchainsWithThisBlock = neighborsBlockchains.filter(blockchain => Blockchain.checkIfBlockchainContainsBlock(block, blockchain));
            let longestBlockchainThatIsValid: Blockchain | undefined = undefined;
            for (const blockchain of neighborsBlockchainsWithThisBlock) {
                if (blockchain.verifyBlockchain()) {
                    if (longestBlockchainThatIsValid === undefined || blockchain.getBlocks.length > longestBlockchainThatIsValid.getBlocks.length) {
                        longestBlockchainThatIsValid = blockchain;
                    }
                }
            }
            console.log("longestBlockchainThatIsValid:")
            console.log(longestBlockchainThatIsValid);
            if (longestBlockchainThatIsValid !== undefined) {
                // for(let block of longestBlockchainThatIsValid.getBlocks) {
                //     this.blocks.push(block);
                //     this.updateOpenTransactions();
                //     // this.adjustDifficulty();
                // }
                blockchain.blocks = longestBlockchainThatIsValid.getBlocks;
                blockchain.lastCheckedBlockIndex = longestBlockchainThatIsValid.getLastCheckedBlockIndex();
                blockchain.nextBlockDifficulty = longestBlockchainThatIsValid.nextBlockDifficulty;
                console.log("changed blockachain");
                return;
            }
        }
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

function handleBlockchainMessage(message: string) : void {
    let blocks: Block[] = Block.fromJsonArray(message);

    let lastBlock = blocks[blocks.length - 1];
    if(lastBlock.getIndex <= blockchain.getLastBlock().getIndex) { // IGNORE
        console.log("Received blockchain is not longer than the current one");
        return;
    }

    let lastLocalBlock = blockchain.getLastBlock();
    let incomingBlockWithIndexOneBiggerThanLocal = blocks.find(block => block.getIndex === lastLocalBlock.getIndex + 1);
    if(incomingBlockWithIndexOneBiggerThanLocal === undefined) {
        console.log("Received blockchain is not valid");
        return;
    }

    if (incomingBlockWithIndexOneBiggerThanLocal.getPreviousHash !== lastLocalBlock.getDisplayHash()) {
        //Sytuacja w której nasz blockchain jest krótszy, i prawdopodobnie został rozgałęziony wcześniej

        //TODO: Musimy wyszukać ostatni blok, który jest wspólny dla obu blockchainów
        //TODO: Jeśli nie ma takiego bloku, to
        // a. otrzymany wycinek blockchain jest za mały i musimy poprosić o więcej bloków - kogo?
        // b. blockchain jest niepoprawny, bo nawet genesis block jest inny

        //Szukanie ostatniego wspólnego bloku
        // let lastCommonBlock: Block | undefined = undefined;
        // for (let i = incomingBlockWithIndexOneBiggerThanLocal.getIndex)
    }

    // W tym momencie chcemy dodać bloki, które są poprawne (x pierwszych bloków po ostatnim bloku w naszym blockchainie)
    // Pozostałe bloki (y ostatnich bloków) zostaną przeanalizowane, transakcje zostaną dodane do kolejki do wydobycia.


    let indexOfIncomingBlockHandled : number =  blocks.findIndex(block => block.getIndex === incomingBlockWithIndexOneBiggerThanLocal?.getIndex - 1) ;
    for(let i = blocks.findIndex(block => block.getIndex === incomingBlockWithIndexOneBiggerThanLocal?.getIndex); i < blocks.length; i++) {
        let addSuccess = blockchain.addBlock(blocks[i]); //Weryfikacja wewnątrz dodawania
        if(!addSuccess) {
            console.log("Error while adding a block of index " + blocks[i].getIndex);
            break;
        }
        indexOfIncomingBlockHandled = i;
    }

    for(let i = indexOfIncomingBlockHandled + 1; i < blocks.length; i++) {
        let block = blocks[i];
        block.getData.getTransactions().forEach(transaction => {
            listToMine.addTransactionToQueue(transaction);
        });
    }
}



export { handleBlockMessage, handleTransactionMessage, handleTextMessage, handleBlockchainMessage };