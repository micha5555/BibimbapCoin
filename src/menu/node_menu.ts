import inquirer from "inquirer";
import {Node} from "../node";
import {
    enum_showIDs,
    enum_genID,
    chose_identity,
    enum_showNeighbors,
    enum_connect,
    add_to_mine,
    mine_block,
    enum_show_items_to_mine,
    enum_showBlocks,
    enum_exit,
    showNeighbors, connectToNeighbor, showBlocks, addToMine
} from "./menu_common_functions";
import {Miner} from "../miner";
import {ListToMine} from "../list_to_mine";

export class NodeMenu {
    _node: Node;
    _chosenIdentity : { privateKey: string, publicKey: string } | null = null;
    _miner: Miner;
    _listToMine: ListToMine;
    _port: number;

    constructor(node: Node, port: number, listToMine: ListToMine) {
        this._node = node;
        this._listToMine = listToMine;
        this._miner = new Miner(this._listToMine, this._node);
        this._port = port;
    }

    async menu() {
        console.log("Node mode");
        let answers = await inquirer.prompt([
            {
                type: "list",
                name: "action",
                message: "What do you want to do?",
                choices: [enum_showIDs, enum_genID, chose_identity, enum_showNeighbors, enum_connect, add_to_mine, mine_block, enum_show_items_to_mine, enum_showBlocks, enum_exit]
            }
        ])

        switch (answers.action) {
            case enum_showIDs:
                await this.showId();
                break;
            case enum_genID:
                await this.generateID();
                break;
            case chose_identity:
                await this.chooseIdentity();
                break;
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
            case mine_block:
                await this.mine();
                break;
            case enum_show_items_to_mine:
                console.log(this._listToMine.getQueue);
                break;
            case enum_exit:
                await this._node.saveNodeToFile(this._port);
                process.exit(0);
            default:
                break;
        }
    }

    async chooseIdentity() {
        if(this._node.getDigitalWallet.identities.length === 0) {
            console.error("No identities found");
            return
        }

        let answer = await inquirer.prompt([{
            type: "list",
            name: "identity",
            message: "Choose identity to mine",
            choices: this._node.getDigitalWallet.identities.map((identity) => identity.publicKey)
        }]);

        this._chosenIdentity = this._node.getDigitalWallet.getIdentityBypublicKey(answer.identity) ?? null;
        if (this._chosenIdentity === null) {
            console.error("Identity not found");
            return
        }
        this._miner.setIdentity(this._chosenIdentity.publicKey);
        console.log(`Chosen identity: ${this._chosenIdentity?.publicKey}`);
    }

    async generateID() {
        this._node.addIdentity();
    }

    async mine() {
        if (this._chosenIdentity === null) {
            console.error("No identity chosen");
            return;
        }

        await this._miner.mine();
        return;
    }

    async showId() {
        this._node.getDigitalWallet.identities.forEach((identity) => {
            console.log(`Public key: ${identity.publicKey}`);
            console.log(`Private key(decrypted): ${identity.privateKey}`);
            console.log("-------------------------------------------------");
        });
    }
}

