import {generateKeyPairSync, createHash, KeyObject} from "node:crypto";
import argon2 from 'argon2';

function generateKeys() {
    return generateKeyPairSync("ed25519", {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: "spki",
            format: "pem",
        },
        privateKeyEncoding: {
            type: "pkcs8",
            format: "pem",
        },
    });
}

function createId(privateKey: KeyObject, publicKey: KeyObject) {
    let conjunctedKeys = privateKey.toString() + publicKey.toString();
    let hashedKeys = createHash("sha1").update(conjunctedKeys).digest("hex");
    return hashedKeys;
}

async function hashPassword(password: string) {
    return argon2.hash(password);
}

export { generateKeys, createId, hashPassword };
