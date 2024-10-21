import express from "express";
import readline from "readline";
import {Controller} from "./controller";
import {Node} from "./node";

import {createId, generateKeys, hashPassword, encrypt, decrypt} from "./key_utils";

const app = express();
app.use(express.json());

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let controller: Controller;
let node: Node = new Node();

rl.question("Enter port number: ", (portInput: string) => {
    let port = handlePortInput(portInput);

    controller = new Controller(app, port, node);

    controller.defineControllerMethods();
    controller.startController();
});


// private functions
function handlePortInput(portInput: string) {
    let port = parseInt(portInput);
    rl.close();

    if (isNaN(port)) {
        console.log("Given port number is not a number!");
        process.exit(1);
    }
    return port;
}
