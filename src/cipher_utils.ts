import {createCipheriv, createDecipheriv, createHash} from "node:crypto";

const encryptionIV = createHash('sha512')
    .update("dsfew542svw")
    .digest('hex')
    .substring(0, 16)
const encryption_method = 'aes-256-cbc';
const pepper = "sdf2453443dw!fwf";

function encrypt(dataToEncrypt:any, password:string) {
    const passwordWithPepper = password + pepper;
    const key = createHash('sha512')
        .update(passwordWithPepper)
        .digest('hex')
        .substring(0, 32)
    const cipher = createCipheriv(encryption_method, key, encryptionIV)
    return Buffer.from(
        cipher.update(dataToEncrypt, 'utf8', 'hex') + cipher.final('hex')
    ).toString('base64')
}

function decrypt(dataToDecrypt:string, password:string) {
    const passwordWithPepper = password + pepper;
    const key = createHash('sha512')
        .update(passwordWithPepper)
        .digest('hex')
        .substring(0, 32)
    const buff = Buffer.from(dataToDecrypt, 'base64')
    const decipher = createDecipheriv(encryption_method, key, encryptionIV)
    return (
        decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
        decipher.final('utf8')
    )
}

export { encrypt, decrypt };