import {Controller} from "./controller";
import {Express, Request, Response} from "express";
import {Node} from "../nodes/node";
import {NodeWallet} from "../nodes/node_wallet";
import {encrypt, generateKeys, verifyPassword} from "../crypto_utils";
import {openTransactions} from "../index";
import {Transaction, TransactionInput, TransactionOutput} from "../transaction";

export class WalletController extends Controller {
    constructor(app: Express, port: number, node: Node) {
        super(app, port, node);
        this.app = app;
        this.port = port;
        this.node = node;
    }

    defineControllerMethods() {
        super.defineControllerMethods();
        this.app.post("/get-identities", async (request: Request, response: Response): Promise<void> => {
            let port = request.body.port;
            let password = request.body.password;
            if (port == null || password == null) {
                response.status(400)
                    .send("Port and password are required");
                return;
            } else {
                let user = (this.node as NodeWallet).getDigitalWallet.userData;

                if (user.port === port) {
                    if (await verifyPassword(user.password, password)) {
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
            response.status(400)
                .send("User not found");
        })

        this.app.post("/add-identity", async (request: Request, response: Response): Promise<void> => {
            let port = request.body.port;
            let password = request.body.password;
            let {privateKey, publicKey} = generateKeys();
            if (port == null || password == null) {
                response.status(400)
                    .send("Port and password are required");
                return;
            } else {
                let user = (this.node as NodeWallet).getDigitalWallet.userData;
                if (user != null && user.port === port) {
                    if (await verifyPassword(user.password, password)) {
                        (this.node as NodeWallet).getDigitalWallet.addIdentity(/*port, user.password, */encrypt(privateKey, password), publicKey);
                        response.status(200)
                            .send("Identity added");
                        return;
                    } else {
                        response.status(400)
                            .send("Incorrect password");
                        return;
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
                const user = (this.node as NodeWallet).getDigitalWallet.userData;

                if (user != null) {
                    console.log("user.port " + user.port);
                    console.log("port " + port);
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
                    } else {
                        response.status(400).send("Incorrect port");
                        return;
                    }
                }


                (this.node as NodeWallet).getDigitalWallet.registerUser(port, password);

                response.status(200).send("User registered");
            }
        });

        this.app.post("/add-transaction", async (request: Request, response: Response): Promise<void> => {
            let port = request.body.port;
            let password = request.body.password;
            let transactions = request.body.transactions;
            if (port == null || password == null || transactions == null) {
                response.status(400)
                    .send("Port, password and transactions are required");
                return;
            } else {
                let user = (this.node as NodeWallet).getDigitalWallet.userData;
                if (user.port === port) {
                    if (await verifyPassword(user.password, password)) {
                        let from = transactions.from;
                        let to = transactions.to;
                        let amount: number = transactions.amount;
                        let publicKeyFound = false;
                        for (let publicKey of user.identities.map(identity => identity.publicKey)) {
                            if (publicKey === from) {
                                publicKeyFound = true;
                                break;
                            }
                        }
                        if (!publicKeyFound) {
                            response.status(400)
                                .send("Public key not found");
                            return;
                        }
                        let moneyForSourceAddress = openTransactions.getMoneyForAddress(from);
                        if (moneyForSourceAddress < amount) {
                            response.status(400)
                                .send("Not enough money. Current balance: " + moneyForSourceAddress + " needed: " + amount);
                            return;
                        }
                        // openTransactions.addTransaction(from, to, amount);


                        let outputTransactions = openTransactions.getTransactionsForAddress(from);
                        let gatheredTransactions = [];
                        let sumInput = 0;
                        for (let outTransaction of outputTransactions) {
                            sumInput += outTransaction.amount;
                            gatheredTransactions.push(outTransaction);
                            if (sumInput >= amount) {
                                break;
                            }
                        }

                        let transferedInputTransactions: TransactionInput[] = [];
                        gatheredTransactions.forEach(transaction => {
                            let intran = new TransactionInput(transaction.id, transaction.transactionIndex, transaction.blockIndex, from);
                            transferedInputTransactions.push(intran);
                        });

                        let outputTrans: TransactionOutput[] = [TransactionOutput.TransactionToAddress(amount, to)];
                        if (sumInput > amount) {
                            outputTrans.push(TransactionOutput.TransactionToAddress(sumInput - amount, from));
                        }

                        // (inputTransactions: TransactionInput[], outputTransactions: TransactionOutput[], timestamp: Date, publicKey: string, transactionSignature: string)
                        let transaction = new Transaction(transferedInputTransactions, outputTrans, new Date(), from, "");
                        let transactionInJson = transaction.toJson();
                        console.log(transactionInJson);

                        response.status(200)
                            .send("Transactions added");
                        return;
                    } else {
                        response.status(400)
                            .send("Incorrect password");
                        return;
                    }
                }

                response.status(400)
                    .send("User not found");
            }
        });

        this.app.post("/get-balance", async (request: Request, response: Response): Promise<void> => {
            let port = request.body.port;
            let password = request.body.password;
            let publicKey = request.body.publicKey;
            if (port == null || password == null || publicKey == null) {
                response.status(400)
                    .send("Port, password and public key are required");
                return;
            } else {
                let user = (this.node as NodeWallet).getDigitalWallet.userData;
                if (user.port === port) {
                    if (await verifyPassword(user.password, password)) {
                        let moneyForAddress = openTransactions.getMoneyForAddress(publicKey);
                        response.status(200)
                            .send("Current balance: " + moneyForAddress);
                        return;
                    } else {
                        response.status(400)
                            .send("Incorrect password");
                        return;
                    }
                }
                response.status(400)
                    .send("User not found");
            }
        });
    }
}