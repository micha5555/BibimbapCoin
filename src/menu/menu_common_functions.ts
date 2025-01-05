import inquirer from "inquirer";
import {Node} from "../nodes/node";
import {blockchain, connect} from "../index";
import {ListToMine} from "../list_to_mine";

// menu options
export const enum_showIDs = "Show IDs";
export const enum_genID = "Generate ID";
export const enum_showNeighbors = "Show neighbors";
export const enum_connect = "Connect to neighbor";
export const enum_showBlocks = "Show blocks";
export const enum_exit = "Exit";
export const add_to_mine = "Add message to mine"; //TODO? Delete
export const mine_block = "Mine block";
export const chose_identity = "Choose identity to mine";
export const enum_show_items_to_mine = "Show items to mine";
export const enum_login_to_wallet = "Login to wallet";
export const enum_fetch_identities_from_wallet = "Fetch identities from wallet";
export const enum_send_transaction = "Send transaction";
export const enum_calculate_balances = "Calculate balances";

export async function showNeighbors(node: Node) {
    console.log(node.getNeighbors());
}

export async function connectToNeighbor(node: Node) {
    let answers = await inquirer.prompt([
        {
            type: "input",
            name: "port",
            message: "Enter port number of neighbor"
        }
    ])

    let port = parseInt(answers.port);
    if (isNaN(port)) {
        console.error("Given port number is not a number!");
        return;
    }

    if (node.getNeighbor(port) !== undefined) {
        console.error(`Port ${port} is already a neighbor`);
        return;
    }

    try {
        await connect(port);
        await node.assignNeighborBlockchainToNode(port);
        await node.assignNeighbourListToMineToNode(port);
        node.addNeighbor(port);
        console.log(`Neighbor on port ${port} added`);
    }
    catch (error) {
        console.error(`Failed to connect to neighbor on port ${port}`);
    }
}

export async function showBlocks(node: Node) {
    blockchain.displayBlockChain()
}

// TODO: broadcast
export async function addToMine(listToMine: ListToMine) {
    let message = await inquirer.prompt([
        {
            type: "input",
            name: "message",
            message: "Enter message to mine"
        }
    ])
    listToMine.addItemToMine(message.message);
}