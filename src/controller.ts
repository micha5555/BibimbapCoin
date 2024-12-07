import {Express, Request, Response} from "express";
import {Node} from "./node";
import {hashTheMessage} from "./crypto_utils";
import {handleBlockMessage, handleTextMessage, MessageType} from "./handlers/broadcast_message_handler";
import {Message} from "./message";

export class Controller {
    app: Express;
    port: number;
    node: Node;

    constructor(app: Express, port: number, node: Node) {
        this.app = app;
        this.port = port;
        this.node = node;
    }

    defineControllerMethods(): void {
        this.app.get("/", (request: Request, response: Response): void => {
            response.send(`Hello, world! This is a simple P2P network. I'm a node with port ${this.port}.`);
        });

        this.app.post("/connect", (request: Request, response: Response): void => {
            let port = request.body.port;
            let askForBlockChain = request.body.askForBlockchain;
            if(askForBlockChain) {
                this.node.assignNeighborBlockchainToNode(port);
            }
            this.node.addNeighbor(port);
            response.status(201)
                .send(`Neighbor on port ${port} added`);
        })

        this.app.get("/get-neighbors", (request: Request, response: Response): void => {
            response.status(200)
                .send(this.node.getNeighbors());
        })

        this.app.get("/is-alive", (request: Request, response: Response): void => {
            response.status(200)
                .send(`Node on ${this.port} is alive`)
        })

        this.app.get("/get-messages", (request: Request, response: Response): void => {
            response.status(200)
                .send(this.node.getBroadcastedMessages);
        })

        this.app.get("/get-blocks", (request: Request, response: Response): void => {
            response.status(200)
                .send(this.node.getBlocks);
        })

        this.app.post("/broadcast-message", (request: Request, response: Response): void => {
            let message = Message.recreateMessageJson(JSON.stringify(request.body));
            const nodeHasThisMessage = this.node.doesNodeAlreadyHasMessage(message.getMessageHash());
            if(nodeHasThisMessage) {
                response.status(201)
                    .send(`The node ${this.port} already has this message`);
            } else {
                this.node.broadcastMessage(message);
                switch(message.messageType) {
                    case MessageType.BLOCK:
                        handleBlockMessage(message.message, this.node);
                        break;
                    case MessageType.TEXT:
                        handleTextMessage(message.message);
                        break;
                    case MessageType.TRANSACTION:
                        break;
                }
                response.status(200)
                    .send(`Message broadcasted to all neighbors from node ${this.port}`);
            }

        })
    }

    startController(): void {
        this.app.listen(this.port, (): void => { });
    }
}
