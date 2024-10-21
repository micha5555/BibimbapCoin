import express, { Request, Response } from "express";
import readline from "readline";

const app = express();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let port: number;

rl.question("Enter port number: ", (portInput: string) => {
    port = parseInt(portInput);
    rl.close();

    if(isNaN(port)) {
        console.log("Given port number is not a number!");
        process.exit(1);
    }

    app.listen(port, (): void => {
        console.log("Started application on port %d", port);
    });
});

app.get("/", (request: Request, response: Response): void => {
    response.send("Hello, world!");
});

app.post("/connect", (request: Request, response: Response): void => {

})

app.get("/get-neighbors", (request: Request, response: Response): void => {

})

app.get("/is-alive", (request: Request, response: Response): void => {
    response.status(200)
        .send(`Node on ${port} is alive`)
})
