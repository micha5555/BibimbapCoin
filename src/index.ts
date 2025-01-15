import express from "express";
import 'reflect-metadata';
import {Controller} from "./controllers/controller";
import {Node} from "./nodes/node";

import inquirer from "inquirer";
import * as Timers from "node:timers";
import {TransactionQueueToMine} from "./transaction_queue_to_mine";
import {NodeMenu} from "./menu/node_menu";
import {WalletMenu} from "./menu/wallet_menu";
import {OpenTransactions} from "./transactions/transactions_open";
import {Blockchain} from "./blockchain";
import {WalletController} from "./controllers/wallet_controller";
import {NodeController} from "./controllers/node_controller";
import {NodeWallet} from "./nodes/node_wallet";
import {NodeNode} from "./nodes/node_node";

enum ModeOfRunning {
    NODE = 'NODE',
    WALLET = 'WALLET'
}

let runningMode: ModeOfRunning;

const app = express();
app.use(express.json());

let controller: Controller;
export let node: Node;
export let listToMine = new TransactionQueueToMine();
export let openTransactions = new OpenTransactions();
// used to validate transactions with already added transactions to queue
export let openTransactionsCopy = new OpenTransactions();
export let blockchain = new Blockchain();

const interval_time = 10000;
Timers.setInterval(() => {
    pollNeighbors();
}, interval_time);

const main = async () => {
    // const {port, password} = await handleRegisterAndLogin();
    let port = await getPort();
    let menu = await selectAndCreateMenu(port, listToMine);
    node.setPort(port);
    if(runningMode === ModeOfRunning.WALLET) {
        await (node as NodeWallet).loadDigitalWalletFromFile();
    }
    await startServer(port);
    while (true) {
        await menu.menu();
    }
}

main();

// private functions
// async function getPassword(): Promise<string> {
//     let answer = await inquirer.prompt([
//         {
//             type: "password",
//             name: "password",
//             message: "Enter password"
//         }
//     ]);
//     return answer.password;
// }

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

async function getPort() {
    let answers = await inquirer.prompt([
        {
            type: "input",
            name: "port",
            message: "Enter port number"
        }
    ]);
    return handlePortInput(answers.port);
}

async function selectAndCreateMenu(port: number, listToMine: TransactionQueueToMine) {
    let answers = await inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "Select mode",
            choices: [ModeOfRunning.NODE, ModeOfRunning.WALLET]
        }
    ])

    switch (answers.action) {
        case ModeOfRunning.NODE:
            runningMode = ModeOfRunning.NODE;
            node = new NodeNode();
            return new NodeMenu((node as NodeNode), port, listToMine);
        case ModeOfRunning.WALLET:
            runningMode = ModeOfRunning.WALLET;
            node = new NodeWallet();
            return new WalletMenu((node as NodeWallet), port, listToMine);
    }

    // TODO: zastanwoić się czy to zwracać domyślnie
    runningMode = ModeOfRunning.NODE;
    return new NodeMenu((node as NodeNode), port, listToMine);
}

async function startServer(port: number) {
    if(runningMode === ModeOfRunning.NODE) {
        controller = new NodeController(app, port, node);
    } else if(runningMode === ModeOfRunning.WALLET) {
        controller = new WalletController(app, port, node);
    }
    controller.defineControllerMethods();
    controller.startController();
    console.log(`Server started on port ${port}`);
}

function handlePortInput(portInput: string) {
    let port = parseInt(portInput);


    if (isNaN(port)) {
        console.error("Given port number is not a number!");
        process.exit(1);
    }
    return port;
}

export async function connect(port: number, askForBlockchain: boolean = true)
{
    const response = await fetch(`http://localhost:${port}/connect`, {
        method: 'POST',
        body: JSON.stringify({port: controller.port, askForBlockchain: askForBlockchain}),
        headers: {
            'Content-Type': 'application/json'
        }
    })

    if (!response.ok) {
        throw new Error(`Failed to connect to port ${port}: ${response.statusText}`);
    }

}

function pollNeighbors() {
     node.getNeighbors().forEach(async neighbor => {
         await pollNeighbor(neighbor.port)
    });
}

async function pollNeighbor(port: number) {
    try
    {
        let result = await fetch(`http://localhost:${port}/is-alive`);
        if (!result.ok) {
            node.setNeighborStatus(port, false);
        }
        else {
            let neighbor = node.getNeighbor(port)
            if(neighbor?.isAlive === false)
            {
                node.setNeighborStatus(port, true);
                try {
                    await connect(port, true);
                }
                catch (error) {
                    node.setNeighborStatus(port, false);
                }
            }

        }
    }
    catch (error){
        node.setNeighborStatus(port, false);
    }
}