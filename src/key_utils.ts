import {generateKeyPairSync, createHash, KeyObject, createCipheriv, createDecipheriv} from "node:crypto";
import argon2 from 'argon2';

const encryptionIV = createHash('sha512')
    .update("dsfew542svw")
    .digest('hex')
    .substring(0, 16)
const encryption_method = 'aes-256-cbc';

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

function encrypt(dataToEncrypt:any, password:string) {
    const key = createHash('sha512')
        .update(password)
        .digest('hex')
        .substring(0, 32)
    const cipher = createCipheriv(encryption_method, key, encryptionIV)
    return Buffer.from(
        cipher.update(dataToEncrypt, 'utf8', 'hex') + cipher.final('hex')
    ).toString('base64')
}

function decrypt(dataToDecrypt:string, password:string) {
    const key = createHash('sha512')
        .update(password)
        .digest('hex')
        .substring(0, 32)
    const buff = Buffer.from(dataToDecrypt, 'base64')
    const decipher = createDecipheriv(encryption_method, key, encryptionIV)
    return (
        decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
        decipher.final('utf8')
    )
}

export { generateKeys, createId, hashPassword, encrypt, decrypt };
