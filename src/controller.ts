import {Express, Request, Response} from "express";
import {Node} from "./node";

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
    }

    startController(): void {
        this.app.listen(this.port, (): void => {
            console.log("Started application on port %d", this.port);
        });
    }
}
