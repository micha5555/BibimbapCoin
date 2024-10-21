import {generateKeyPairSync, createHash, KeyObject} from "node:crypto";

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

export { generateKeys, createId };
