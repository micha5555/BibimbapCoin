// import express, { Request, Response } from ;
// import crypto from "crypto";

import express, { Express, Request, Response } from "express";

const app = express();

app.get("/", (request: Request, response: Response): void => {
    // const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
    //     publicKeyEncoding: {
    //         type: 'spki',
    //         format: 'pem'
    //     },
    //     privateKeyEncoding: {
    //         type: 'pkcs8',
    //         format: 'pem'
    //     }
    // });
    //
    // // Send the keys as response
    // response.send(publicKey + "\n" + privateKey);
    response.send("Hello, world!");
});

app.listen(10000, (): void => {
    console.log("Started application on port %d", 10000);
});
