import {NodeWallet} from "../nodes/node_wallet";
import {TransactionQueueToMine} from "../list_to_mine";
import inquirer from "inquirer";
import {
    add_to_mine, addToMine, connectToNeighbor,
    enum_connect, enum_exit, enum_show_items_to_mine, enum_showBlocks,
    enum_showNeighbors, showBlocks, showNeighbors
} from "./menu_common_functions";

export class WalletMenu {
    _node: NodeWallet;
    _listToMine: TransactionQueueToMine;
    _port: number;

    constructor(node: NodeWallet, port: number, listToMine: TransactionQueueToMine) {
        this._node = node;
        this._listToMine = listToMine;
        this._port = port;
    }

    async menu() {
        console.log("Wallet mode");
        let answers = await inquirer.prompt([
            {
                type: "list",
                name: "action",
                message: "What do you want to do?",
                choices: [enum_showNeighbors, enum_connect, add_to_mine, enum_show_items_to_mine, enum_showBlocks, enum_exit]
            }
        ])

        switch (answers.action) {
            case enum_showNeighbors:
                await showNeighbors(this._node);
                break;
            case enum_connect:
                await connectToNeighbor(this._node);
                break;
            case enum_showBlocks:
                await showBlocks(this._node);
                break;
            case add_to_mine: //TODO: Add broadcasting this message to neighbors
                await addToMine(this._listToMine);
                break;
            case enum_show_items_to_mine:
                console.log(this._listToMine.getQueue);
                break;
            case enum_exit:
                await this._node.saveNodeToFile();
                process.exit(0);
            default:
                break;
        }
    }
}