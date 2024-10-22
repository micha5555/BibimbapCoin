import {verifyPassword} from "./crypto_utils";

async function validateIfUserExists(
    portNumber: number
): Promise<boolean> {
    const fs = require("fs");
    let mainDir = './data';
    let userDir = mainDir + '/' + portNumber;
    let userFile = userDir + "/node_data.json";
    if (!fs.existsSync(mainDir) || !fs.existsSync(userDir) || !fs.existsSync(userFile)) {
        return false;
    }
    return true;
}

async function validateIfPasswordIsCorrect(
  portNumber: number,
  password: string
): Promise<boolean> {
    const fs = require("fs");
    let userFile = './data/' + portNumber + "/node_data.json";

    let data = fs.readFileSync(userFile);
    let dataJSON = JSON.parse(data);
    let passwordVerificationPromise = verifyPassword(dataJSON.password, password);
    const passwordVerification = passwordVerificationPromise.then((value) => {return value});
    return passwordVerification;
}

export {validateIfUserExists, validateIfPasswordIsCorrect};