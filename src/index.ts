import express, { Express, Request, Response } from "express";

import {createId, generateKeys, hashPassword, encrypt, decrypt} from "./key_utils";

const app = express();

app.get("/", async (request: Request, response: Response): Promise<void> => {

    response.send("Hello World");
});

app.listen(10000, (): void => {
    console.log("Started application on port %d", 10000);
});
