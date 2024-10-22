import express from "express";
import readline from "readline";
import {Controller} from "./controller";
import {Node} from "./node";

import {createId, generateKeys, hashPassword } from "./key_utils";
import {encrypt, decrypt} from "./cipher_utils";
import inquirer from "inquirer";

const app = express();
app.use(express.json());

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let controller: Controller;
let node: Node = new Node();

// rl.question("Enter port number: ", (portInput: string) => {
//     let port = handlePortInput(portInput);
//
//     controller = new Controller(app, port, node);
//
//     controller.defineControllerMethods();
//     controller.startController();
// });



menu();


// private functions
function menu() {
    inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "What do you want to do?",
            choices: ["Show ID", "Show neighbors", "Connect to neighbor", "Exit"]
        }
    ]).then((answers) => {
        switch (answers.action) {
            case "Show ID":
                let keys = generateKeys();
                let id = createId(keys.privateKey, keys.publicKey);
                console.log(`Your ID is: ${id}`);
                break;
            case "Show neighbors":
                console.log(node.getNeighbors());
                break;
            case "Connect to neighbor":
                inquirer.prompt([
                    {
                        type: "input",
                        name: "port",
                        message: "Enter port number of neighbor"
                    }
                ]).then((answers) => {
                    //TODO: call /connect endpoint
                    let port = parseInt(answers.port);
                    node.addNeighbor(port);
                    console.log(`Neighbor on port ${port} added`);
                });
                break;
            case "Exit":
                process.exit(0);
                break;
            default:
                break;
        }
    });
}

function handlePortInput(portInput: string) {
    let port = parseInt(portInput);
    rl.close();

    if (isNaN(port)) {
        console.log("Given port number is not a number!");
        process.exit(1);
    }
    return port;
}
