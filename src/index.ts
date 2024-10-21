import express, { Express, Request, Response } from "express";

import {createId, generateKeys, hashPassword} from "./key_utils";

const app = express();

app.get("/", async (request: Request, response: Response): Promise<void> => {
    // const { publicKey, privateKey } = generateKeys();
    // const id = createId(privateKey, publicKey);
    // response.send(publicKey + "\n" + privateKey);

    const promiseHashed = hashPassword("password");
    const hashed = await promiseHashed.then((value) => {return value});
    promiseHashed.then((value) => {console.log(value)});
    // hashed.then((value) => console.log(value));
    // console.log(promiseHashed.then((value) => console.log(value)));
    console.log(hashed);
    response.send(hashed);
    // response.send(hashed);
});

app.listen(10000, (): void => {
    console.log("Started application on port %d", 10000);
});
