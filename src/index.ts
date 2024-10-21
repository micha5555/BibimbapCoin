// import express, { Request, Response } from ;
// import crypto from "crypto";

import express, { Express, Request, Response } from "express";

const app = express();

app.get("/", (request: Request, response: Response): void => {
    response.send("Hello, world!");
});

app.post("/connect", (request: Request, response: Response): void => {

})

app.get("/get-neighbors", (request: Request, response: Response): void => {

})

app.get("/is-alive", (request: Request, response: Response): void => {
    response.status(200)
        .send("NAME Alive") //TODO: Add name
})

app.listen(10000, (): void => {
    console.log("Started application on port %d", 10000);
});
