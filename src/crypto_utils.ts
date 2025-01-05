import {
    generateKeyPairSync,
    createHash,
    KeyObject,
    createCipheriv,
    createDecipheriv,
    randomBytes,
    sign, verify, createPrivateKey, createPublicKey
} from "node:crypto";
import argon2 from 'argon2';

// const encryption_method = 'aes-256-cbc';
const encryption_method = 'aes-256-gcm';
const pepper = "sdf2453443dw!fwf";
const rounds_of_hashing_password = 57;

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

async function hashPassword(password: string) {
    return argon2.hash(password, {timeCost: rounds_of_hashing_password});
}

function verifyPassword(hash: string, password: string): Promise<boolean> {
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
        cipher.update(dataToEncrypt, 'utf8', 'hex') + cipher.final('hex') + '$$$' + iv + '$$$' + cipher.getAuthTag().toString('hex')
    ).toString('base64')
}

function decrypt(dataToDecrypt:string, password:string) {
    const passwordWithPepper = password + pepper;
    const key = createHash('sha512')
        .update(passwordWithPepper)
        .digest('hex')
        .substring(0, 32)
    const dataToDecryptSplit = Buffer.from(dataToDecrypt, 'base64').toString('utf8').split('$$$');
    const iv = dataToDecryptSplit[1];
    const authTag = dataToDecryptSplit[2];
    const buff = Buffer.from(dataToDecryptSplit[0]);
    const decipher = createDecipheriv(encryption_method, key, iv);
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    return (
        decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
        decipher.final('utf8')
    )
}

function signData(data: string, privateKey: string): string {
    let privateKeyAsKeyObject = createPrivateKeyObjectFromString(privateKey);
    return sign(null, Buffer.from(data), {
        key: privateKeyAsKeyObject,
    }).toString('base64');
}

function verifySignature(data: string, signature: string, publicKey: string): boolean {
    let publicKeyAsKeyObject = createPublicKeyObjectFromString(publicKey);
    return verify(null, Buffer.from(data), {
        key: publicKeyAsKeyObject,
    }, Buffer.from(signature, "base64"));
}

function createPrivateKeyObjectFromString(privateKeyFragment: string): KeyObject {
    const pem = `-----BEGIN PRIVATE KEY-----\n${privateKeyFragment}\n-----END PRIVATE KEY-----`;
    return createPrivateKey({
        key: pem,
        format: 'pem',
        type: 'pkcs8'
    });
}

function createPublicKeyObjectFromString(publicKeyFragment: string): KeyObject {
    const pem = `-----BEGIN PUBLIC KEY-----\n${publicKeyFragment}\n-----END PUBLIC KEY-----`;
    return createPublicKey({
        key: pem,
        format: 'pem',
        type: 'spki'
    });
}

function hashTheMessage(body: string) {
    return createHash("sha1").update(body).digest("hex");
}

export { generateKeys, hashPassword, extractOnlyKeyContent, verifyPassword, encrypt, decrypt, hashTheMessage, signData, verifySignature };