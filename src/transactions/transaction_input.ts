import {createHash} from "node:crypto";
import {Exclude, Expose, serialize} from "class-transformer";

@Exclude()
export class TransactionInput {
    @Expose()
    public transactionOutputId: string;
    @Expose()
    public transactionIndex: number;
    @Expose()
    public blockIndex: number;
    public address: string;
    public amount: number = 0;

    constructor(transactionOutputId: string, transactionIndex: number, blockIndex: number, address: string) {
        this.transactionOutputId = transactionOutputId;
        this.transactionIndex = transactionIndex;
        this.blockIndex = blockIndex;
        this.address = address;
    }

    calculateHash() : string {
        return createHash('sha256')
            .update(this.transactionOutputId + this.transactionIndex + this.blockIndex)
            .digest()
            .toString();
    }

    // toJson(): any {
    //     return {transactionOutputId: this.transactionOutputId, transactionIndex: this.transactionIndex, blockIndex: this.blockIndex};
    // }

    toJson(): any {
        return serialize(this)
    }
}