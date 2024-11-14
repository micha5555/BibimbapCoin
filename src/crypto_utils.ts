import {generateKeyPairSync, createHash, KeyObject, createCipheriv, createDecipheriv, randomBytes} from "node:crypto";
import argon2 from 'argon2';

const encryption_method = 'aes-256-cbc';
// const encryption_method_2 = 'aes-256-gcm';
const pepper = "sdf2453443dw!fwf";

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

async function verifyPassword(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
}

function extractOnlyKeyContent(key: KeyObject) {
    return key.toString().split("\n").slice(1, -2).join("\n").trim();
}

function encrypt(dataToEncrypt:any, password:string) {
    let iv = randomBytes(16).toString('hex');
    iv = createHash('sha512')
        .update(iv)
        .digest('hex')
        .substring(0, 16)
    const passwordWithPepper = password + pepper;
    const key = createHash('sha512')
        .update(passwordWithPepper)
        .digest('hex')
        .substring(0, 32)
    const cipher = createCipheriv(encryption_method, key, iv)
    return Buffer.from(
        cipher.update(dataToEncrypt, 'utf8', 'hex') + cipher.final('hex') + '$$$' + iv
    ).toString('base64')
}

function decrypt(dataToDecrypt:string, password:string) {
    const passwordWithPepper = password + pepper;
    const key = createHash('sha512')
        .update(passwordWithPepper)
        .digest('hex')
        .substring(0, 32)
    const dataToDecryptString = Buffer.from(dataToDecrypt, 'base64').toString('utf8');
    const iv = dataToDecryptString.split('$$$')[1];
    const buff = Buffer.from(dataToDecryptString.split('$$$')[0]);
    const decipher = createDecipheriv(encryption_method, key, iv)
    return (
        decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
        decipher.final('utf8')
    )
}

export { generateKeys, createId, hashPassword, extractOnlyKeyContent, verifyPassword, encrypt, decrypt };