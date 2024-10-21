import express, { Express, Request, Response } from "express";

import {createId, generateKeys, hashPassword } from "./key_utils";
import {encrypt, decrypt} from "./cipher_utils";

const app = express();

app.get("/", async (request: Request, response: Response): Promise<void> => {

    response.send("Hello World");
});

app.listen(10000, (): void => {
    console.log("Started application on port %d", 10000);
});
