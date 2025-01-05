import inquirer from "inquirer";
import {Node} from "../nodes/node";
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
    showNeighbors, connectToNeighbor, showBlocks, addToMine, enum_login_to_wallet, enum_fetch_identities_from_wallet
} from "./menu_common_functions";
import {Miner} from "../miner";
import {TransactionQueueToMine} from "../transaction_queue_to_mine";
import {NodeNode} from "../nodes/node_node";

export class NodeMenu {
    _node: NodeNode;
    _chosenIdentity: string | null = null;
    _miner: Miner;
    _listToMine: TransactionQueueToMine;
    _port: number;

    constructor(node: NodeNode, port: number, listToMine: TransactionQueueToMine) {
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
                choices: [enum_login_to_wallet, enum_fetch_identities_from_wallet, enum_showIDs, enum_genID, chose_identity, enum_showNeighbors, enum_connect, add_to_mine, mine_block, enum_show_items_to_mine, enum_showBlocks, enum_exit]
            }
        ])

        switch (answers.action) {
            case enum_login_to_wallet:
                await this.loginToWallet();
                break
            case enum_fetch_identities_from_wallet:
                await this.fetchIdentitiesFromWallet();
                break
            case enum_showIDs:
                // coś nei wyświetla
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
                // await this._node.saveNodeToFile(this._port);
                process.exit(0);
            default:
                break;
        }
    }

    async loginToWallet() {
        let walletPort = await this.getWalletPort();
        let password = await this.getPassword();
        try {
            let result = await fetch(`http://localhost:`+ walletPort + '/login-user', {
                method: 'POST',
                body: JSON.stringify({port: this._port, password: password}),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            if(result.status !== 200) {
                console.error("Failed to login to wallet");
                return;
            } else {
                this._node.setPassword(password);
                this._node.setWalletPort(walletPort);
                console.log("Logged in to wallet");
            }
        } catch (e) {
            console.error("Failed to connect to Wallet");
        }

    }

    async fetchIdentitiesFromWallet() {
        try {
            let walletPort = await this._node.getWalletPort();
            // console.log("walletPort: " + walletPort);
            let result = await fetch(`http://localhost:`+ walletPort + '/get-identities', {
                method: 'POST',
                body: JSON.stringify({port: this._port, password: this._node.getPassword()}),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            if(result.status !== 200) {
                // console.log(result.status);
                // console.log(result.statusText);
                console.error("Failed to fetch identities from wallet");
                return;
            } else {
                let identities = await result.json();
                // console.log("identities: " + identities);
                this._node.addIdentities(identities);
                console.log("Fetched identities from wallet");
            }
        } catch (e) {
            console.error("Failed to connect to Wallet");
        }

    }



    // async function handleRegisterAndLogin() {
//     let passwordValidation = false;
//     let port = 0;
//     let password = "";
//     let loadNodeDataFromFile = false;
//     while (!passwordValidation) {
//         port = await getPort();
//         password = await getPassword();
//         let validateExistingOfUser = await validateIfUserExists(port);
//         if (!validateExistingOfUser) {
//             break;
//         }
//         let validatePassword = await validateIfPasswordIsCorrect(port, password);
//         if (!validatePassword) {
//             console.error("Incorrect password");
//             continue;
//         }
//         passwordValidation = true;
//         loadNodeDataFromFile = true;
//     }
//     node.setPassword(password);
//
//     if (loadNodeDataFromFile) {
//         await node.loadDigitalWalletFromFile(port);
//     }
//
//     return {port, password};
// }

    async chooseIdentity() {
        // TODO: ucomment
        if(this._node.getIdentities().length === 0) {
            console.error("No identities found");
            return
        }

        let answer = await inquirer.prompt([{
            type: "list",
            name: "identity",
            message: "Choose identity to mine",
            choices: this._node.getIdentities()
        }]);

        console.log("chosen: " + answer.identity);
        this._chosenIdentity = answer.identity ?? null;
        if (this._chosenIdentity === null) {
            console.error("Identity not found");
            return
        }
        this._miner.setIdentity(this._chosenIdentity);
        console.log(`Chosen identity: ${this._chosenIdentity}`);
    }

    async generateID() {
        try {
            let result = await fetch(`http://localhost:`+ this._node.getWalletPort() + '/add-identity', {
                method: 'POST',
                body: JSON.stringify({port: this._port, password: this._node.getPassword()}),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            if(result.status !== 200) {
                console.error("Failed to generate identity");
                return;
            } else {
                console.log("Identity generated");
            }
        } catch (e) {
            console.error("Failed to connect to Wallet");
        }

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
        this._node.getIdentities().forEach((identity) => {
            console.log(`Public key: ${identity}`);
            console.log("-------------------------------------------------");
        });
    }

    async getWalletPort() {
        let answers = await inquirer.prompt([
            {
                type: "input",
                name: "port",
                message: "Enter wallet port number"
            }
        ]);
        let port = parseInt(answers.port);

        if (isNaN(port)) {
            console.error("Given port number is not a number!");
            return -1;
        }
        return port;
    }

    async getPassword(): Promise<string> {
        let answer = await inquirer.prompt([
            {
                type: "password",
                name: "password",
                message: "Enter your password"
            }
        ]);
        return answer.password;
    }
}

