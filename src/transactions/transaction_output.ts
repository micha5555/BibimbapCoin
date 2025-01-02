import {createHash, randomUUID} from "node:crypto";
import {serialize} from "class-transformer";

export class TransactionOutput {
    public id: string;
    public address: string;
    public amount: number;
    public tempBlocked: boolean = false;
    public blockIndex: number = -1;
    public transactionIndex: number = -1;

    constructor(id: string, amount: number, address: string) {
        this.id = id;
        this.amount = amount;
        this.address = address;
    }

    static TransactionToAddress(amount: number, address: string) : TransactionOutput {
        return new TransactionOutput(randomUUID(), amount, address);
    }

    calculateHash() : string {
        return createHash('sha256')
            .update(this.id + this.amount + this.address)
            .digest()
            .toString();
    }

    // toJson(): any {
    //     return {id: this.id, amount: this.amount, address: this.address};
    // }

    toJson(): any {
        return serialize(this); //JSON.stringify(instanceToPlain(this)); //alternative
    }

}