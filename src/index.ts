import express, { Express, Request, Response } from "express";

import {createId, generateKeys} from "./key_utils";

const app = express();

app.get("/", (request: Request, response: Response): void => {
    const { publicKey, privateKey } = generateKeys();
    const id = createId(privateKey, publicKey);
    // response.send(publicKey + "\n" + privateKey);
    response.send(id);
});

app.listen(10000, (): void => {
    console.log("Started application on port %d", 10000);
});
