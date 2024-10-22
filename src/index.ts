import express from "express";
import {Controller} from "./controller";
import {Node} from "./node";

import {createId, generateKeys, hashPassword} from "./key_utils";
import inquirer from "inquirer";
import * as http from "node:http";
import * as Timers from "node:timers";

const app = express();
app.use(express.json());

let controller: Controller;
let node: Node = new Node();

const enum_showIDs = "Show IDs";
const enum_genID = "Generate ID";
const enum_showNeighbors = "Show neighbors";
const enum_connect = "Connect to neighbor";
const enum_exit = "Exit";

const interval_time = 10000;
Timers.setInterval(() => {
    pollNeighbors();
}, interval_time);


const main = async () => {
    await handlerPassword(await getPassword());
    await startServer(await getPort());
    while (true) {
        await menu();
    }
}

main();


// private functions
async function getPassword(): Promise<string> {
    let answer = await inquirer.prompt([
        {
            type: "password",
            name: "password",
            message: "Enter password"
        }
    ]);
    return answer.password;
}

async function handlerPassword(password: string) {
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
    return handlePortInput(answers.port);
}

async function startServer(port: number) {
    controller = new Controller(app, port, node);

    controller.defineControllerMethods();
    controller.startController();
    console.log(`Server started on port ${port}`);
}

async function menu() {
    let answers = await inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "What do you want to do?",
            choices: [enum_showIDs, enum_genID, enum_showNeighbors, enum_connect, enum_exit]
        }
    ])

    switch (answers.action) {
        case enum_showIDs:
            await showId();
            break;
        case enum_genID:
            await generateID();
            break;
        case enum_showNeighbors:
            await showNeighbors();
            break;
        case enum_connect:
            await connectToNeighbor();
            break;
        case enum_exit:
            process.exit(0);
        default:
            break;
    }
}

function handlePortInput(portInput: string) {
    let port = parseInt(portInput);


    if (isNaN(port)) {
        console.error("Given port number is not a number!");
        process.exit(1);
    }
    return port;
}

async function showId() {
    //TODO: Use wallet, replace implementation below
    let keys = generateKeys();
    let id = createId(keys.privateKey, keys.publicKey);
    console.log(`ID: ${id}`);
}

async function showNeighbors() {
    console.log(node.getNeighbors());
}

async function connectToNeighbor() {
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
        node.addNeighbor(port);
        console.log(`Neighbor on port ${port} added`);
    }
    catch (error) {
        console.error(`Failed to connect to neighbor on port ${port}`);
    }
}

async function generateID() {
    let keys = generateKeys();
    let id = createId(keys.privateKey, keys.publicKey);
    console.log(`ID: ${id}`);
}

async function connect(port: number)
{
    const response = await fetch(`http://localhost:${port}/connect`, {
        method: 'POST',
        body: JSON.stringify({port: controller.port}),
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
                    await connect(port);
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