import express from "express";
import {Controller} from "./controller";
import {Node} from "./node";

import {createId, generateKeys, hashPassword} from "./key_utils";
import inquirer from "inquirer";

const app = express();
app.use(express.json());

let controller: Controller;
let node: Node = new Node();


const main = async () => {
    await handlerPassword(await getPassword());
    await startServer(await getPort());
    menu();
}

main();


// private functions
async function getPassword() : Promise<string> {
    let answer =  await inquirer.prompt([
        {
            type: "password",
            name: "password",
            message: "Enter password"
        }
    ]);
    return answer.password;
}

async function handlerPassword(password : string){
    let res = await hashPassword(password)
    console.log(`Password hashed: ${res}`);
}

async function getPort() {
    let answers = await inquirer.prompt([
        {
            type: "input",
            name: "port",
            message: "Enter port number"
        }
    ]);
    return parseInt(answers.port);
}

async function startServer(port: number) {
    controller = new Controller(app, port, node);

    controller.defineControllerMethods();
    controller.startController();
    console.log(`Server started on port ${port}`);
}

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
        menu();
    });
}

function handlePortInput(portInput: string) {
    let port = parseInt(portInput);


    if (isNaN(port)) {
        console.log("Given port number is not a number!");
        process.exit(1);
    }
    return port;
}
