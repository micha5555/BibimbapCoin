import express, { Express, Request, Response } from "express";

import {generateKeys} from "./key_utils";

const app = express();

app.get("/", (request: Request, response: Response): void => {
    const { publicKey, privateKey } = generateKeys();
    // response.send(publicKey + "\n" + privateKey);
    response.send("Hello, world!");
});

app.listen(10000, (): void => {
    console.log("Started application on port %d", 10000);
});
