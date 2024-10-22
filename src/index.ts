import express from "express";
import readline from "readline";
import {Controller} from "./controller";
import {Node} from "./node";

import {createId, generateKeys, hashPassword} from "./key_utils";
import {encrypt, decrypt} from "./cipher_utils";
import {resolve} from "node:dns/promises";

const app = express();
app.use(express.json());

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let controller: Controller;
let node: Node = new Node();

const question1 = () => {
    return new Promise<void>((resolve, reject) => {
            rl.question("Enter password: ", (password: string) => {

                resolve();
            });
        }
    )
}

const question2 = () => {
    return new Promise<void>((resolve, reject) => {
            rl.question("Enter port number: ", (portInput: string) => {
                let port = handlePortInput(portInput);
                controller = new Controller(app, port, node);

                controller.defineControllerMethods();
                controller.startController();
            });
        }
    )
}


const main = async () => {
    await question1();
    await question2();
}

main();


// private functions
function handlePortInput(portInput: string) {
    let port = parseInt(portInput);


    if (isNaN(port)) {
        console.log("Given port number is not a number!");
        process.exit(1);
    }
    return port;
}
