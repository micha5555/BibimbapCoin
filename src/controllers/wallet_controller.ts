import {Controller} from "./controller";
import {Express, Request, Response} from "express";
import {Node} from "../nodes/node";
import {NodeWallet} from "../nodes/node_wallet";
import {generateKeys, verifyPassword} from "../crypto_utils";

export class WalletController extends Controller {
    constructor(app: Express, port: number, node: Node) {
        super(app, port, node);
        this.app = app;
        this.port = port;
        this.node = node;
    }

    defineControllerMethods() {
        super.defineControllerMethods();
        this.app.get("/get-identities", async (request: Request, response: Response): Promise<void> => {
            let port = request.body.port;
            let password = request.body.password;
            if(port == null || password == null) {
                response.status(400)
                    .send("Port and password are required");
                return;
            } else {
                for(let user of (this.node as NodeWallet).getDigitalWallet.usersIdentities) {
                    if(user.port === port) {
                        if(await verifyPassword(user.password, password)) {
                            response.status(200)
                                .send(user.identities.map(identity => identity.publicKey));
                            return;
                        } else {
                            response.status(400)
                                .send("Incorrect password");
                            return;
                        }
                    }
                }
            }
            response.status(400)
                .send("User not found");
        })

        this.app.post("/add-identity", async (request: Request, response: Response): Promise<void> => {
            let port = request.body.port;
            let password = request.body.password;
            let { privateKey, publicKey } = generateKeys();
            if(port == null || password == null) {
                response.status(400)
                    .send("Port and password are required");
                return;
            } else {
                for(let user of (this.node as NodeWallet).getDigitalWallet.usersIdentities) {
                    if(user.port === port) {
                        if(await verifyPassword(user.password, password)) {
                            (this.node as NodeWallet).getDigitalWallet.addIdentity(port, user.password, privateKey, publicKey);
                            response.status(200)
                                .send("Identity added");
                            return;
                        } else {
                            response.status(400)
                                .send("Incorrect password");
                            return;
                        }
                    }
                }
                response.status(400)
                    .send("User not found");
            }
        });

        this.app.post("/login-user", async (request: Request, response: Response): Promise<void> => {
            const port = request.body.port;
            const password = request.body.password;

            if (port == null || password == null) {
                response.status(400).send("Port and password are required");
            } else {
                const usersIdentities = (this.node as NodeWallet).getDigitalWallet.usersIdentities;

                for (const user of usersIdentities) {
                    if (user.port === port) {
                        try {
                            const passwordVerified = await verifyPassword(user.password, password);

                            if (passwordVerified) {
                                response.status(200).send("User logged in");
                            } else {
                                response.status(400).send("Incorrect password");
                            }
                            return; // Exit loop and response once a match is found
                        } catch (error) {
                            response.status(500).send("Error verifying password");
                            return;
                        }
                    }
                }

                (this.node as NodeWallet).getDigitalWallet.registerUser(port, password);

                response.status(200).send("User registered");
            }
        });
    }
}