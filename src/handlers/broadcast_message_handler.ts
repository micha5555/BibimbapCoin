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
            console.log(neighborsBlockchains);
            // let neighborsBlockchainsWithThisBlock = neighborsBlockchains.filter(blockchain => Blockchain.checkIfBlockchainContainsBlock(block, blockchain));
            let longestBlockchainThatIsValid: Block[] | undefined = undefined;
            for (const blockchain of neighborsBlockchains) {
                    if (longestBlockchainThatIsValid === undefined || blockchain.length > longestBlockchainThatIsValid.length) {
                        longestBlockchainThatIsValid = blockchain;
                    }
            }
            console.log("longestBlockchainThatIsValid:")
            console.log(longestBlockchainThatIsValid);
            if(longestBlockchainThatIsValid === undefined) {
                return;
            }

            let copyOfBlockchain = checkRealBlockchain(longestBlockchainThatIsValid);
            if(copyOfBlockchain === undefined) {
                return;
            }

            if(copyOfBlockchain.getLastBlock().getIndex > blockchain.getLastBlock().getIndex) {
                blockchain.replaceBlockchain(copyOfBlockchain);
            }
            else {
                //Nowy blockchain jest krótszy
                return;
            }
        }
    }


    await blockchain.addBlock(block);
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

    let copyOfBlockchain =  checkRealBlockchain(blocks);
    if(copyOfBlockchain === undefined) {
        return;
    }

    if(copyOfBlockchain.getLastBlock().getIndex > blockchain.getLastBlock().getIndex) {
        blockchain.replaceBlockchain(copyOfBlockchain);
    }
    else {
        //Nowy blockchain jest krótszy
        return;
    }
}

function checkRealBlockchain(blocks: Block[]) : Blockchain | undefined {
    let lastBlock = blocks[blocks.length - 1];
    if(lastBlock.getIndex <= blockchain.getLastBlock().getIndex) { // IGNORE
        console.log("Received blockchain is not longer than the current one");
        return;
    }

    let indexOfBlock = blocks.findIndex(block => block.getIndex === blockchain.getLastBlock().getIndex);
    let lastCommonBlock: Block | undefined = undefined;
    let indexOfIncomingBlockArray: number | undefined = undefined;
    for (let i = indexOfBlock; i >= 0; i--) {
        let block = blocks[i];
        let localBlock = blockchain.getBlock(block.getIndex);
        if (block.getDisplayHash === localBlock.getDisplayHash) {
            lastCommonBlock = block;
            indexOfIncomingBlockArray = i;
            break;
        }

    }

    if(lastCommonBlock === undefined || indexOfIncomingBlockArray === undefined) {
        if(blocks[0].getIndex === 0) { //IGNORE
            console.log("Received blockchain has a different genesis block");
            return;
        }

        console.log("Received blockchain is too short - common block not found");
        return;
    }

    let copyOfBlockchain = blockchain.createCopy();
    while(copyOfBlockchain.getLastBlock().getIndex !== lastCommonBlock.getIndex) {
        copyOfBlockchain.removeLastBlock();
    }

    for(let i = indexOfIncomingBlockArray+1; i < blocks.length; i++) {
        let addSuccess = copyOfBlockchain.addBlock(blocks[i]); //Weryfikacja wewnątrz dodawania
        if(!addSuccess) {
            console.log("Error while adding a block of index " + blocks[i].getIndex);
            break;
        }
    }

    return copyOfBlockchain;
}


export { handleBlockMessage, handleTransactionMessage, handleTextMessage, handleBlockchainMessage };