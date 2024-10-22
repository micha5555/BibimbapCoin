import {generateKeyPairSync, createHash, KeyObject, createCipheriv, createDecipheriv} from "node:crypto";
import argon2 from 'argon2';

function generateKeys() {
    const { publicKey, privateKey } = generateKeyPairSync("ed25519", {
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

    const publicKeyExtracted = extractOnlyKeyContent(publicKey);
    const privateKeyExtracted = extractOnlyKeyContent(privateKey);
    return { publicKey: publicKeyExtracted, privateKey: privateKeyExtracted };
}

function createId(privateKey: string, publicKey: string) {
    let conjunctedKeys = privateKey + publicKey;
    let hashedKeys = createHash("sha1").update(conjunctedKeys).digest("hex");
    return hashedKeys;
}

async function hashPassword(password: string) {
    return argon2.hash(password);
}

function extractOnlyKeyContent(key: KeyObject) {
    return key.toString().split("\n").slice(1, -2).join("\n").trim();
}

export { generateKeys, createId, hashPassword, extractOnlyKeyContent };
