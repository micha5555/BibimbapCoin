import {blockchain, listToMine} from "../index";
import {Block} from "../block";
import {Message} from "../message";
import {Transaction} from "../transactions/transaction";
import {Blockchain} from "../blockchain";

export abstract class Node{
    private _neighbors: { port: number, isAlive: boolean }[] = [];
    private _broadcastedMessages: { timestamp: Date, message: string, messageHash: string, messageType: string}[] = [];
    protected port!: number

    setPort(port: number): void {
        this.port = port;
    }

    addNeighbor(port: number): void {
        if(this.getNeighbor(port) === undefined)
        {
            this._neighbors.push({ port, isAlive: true });
        }
    }

    setNeighborStatus(port: number, isAlive: boolean): void {
        let neighbor = this.getNeighbor(port);
        if(neighbor !== undefined)
        {
            neighbor.isAlive = isAlive;
        }
    }

    removeNeighbor(port: number): void {
        this._neighbors = this._neighbors.filter(neighbor => neighbor.port !== port);
    }

    getNeighbors(): { port: number, isAlive: boolean }[] {
        return this._neighbors;
    }

    getNeighbor(port: number): { port: number, isAlive: boolean } | undefined {
        return this._neighbors.find(neighbor => neighbor.port === port);
    }

    addMessage(message: string, messageHash: string, timestamp: Date, messageType: string): void {
        this._broadcastedMessages.push({ timestamp, message, messageHash, messageType });
    }

    get getBroadcastedMessages(): { timestamp: Date, message: string, messageHash: string}[] {
        return this._broadcastedMessages;
    }

    async assignNeighborBlockchainToNode(port: number) {
        const response = await fetch(`http://localhost:${port}/get-blocks`);
        if (!response.ok) {
            throw new Error(`Failed to get blocks from port ${port}: ${response.statusText}`);
        }

        const responseJson = await response.json();
        this.addBlockchainFromJson(responseJson);
    }

    async assignNeighbourListToMineToNode(port: number) {
        const response = await fetch(`http://localhost:${port}/get-items-to-mine`);
        if (!response.ok) {
            throw new Error(`Failed to get items to mine from port ${port}: ${response.statusText}`);
        }

        const responseJson = await response.json();
        this.addListToMineFromJson(responseJson);
    }

    addBlockchainFromJson(responseJson: any): void {
        let blocks: Block[] = [];
        for (let blockJson of responseJson) {
            blocks.push(Block.fromJson(JSON.stringify(blockJson)));
        }
        blockchain.addBatchOfBlocks(blocks);
    }

    addListToMineFromJson(responseJson: any): void {
        for (let item of responseJson) {
            listToMine.addTransactionToQueue(Transaction.recreateTransactionJson(JSON.stringify(item)));
        }
    }

    doesNodeAlreadyHasMessage(messageHash: string): boolean {
        for (let i = 0; i < this._broadcastedMessages.length; i++) {
            if(this._broadcastedMessages[i].messageHash == messageHash)
            {
                return true;
            }
        }
        return false;
    }

    async broadcastMessage(message: Message): Promise<void> {
        this.addMessage(message.message, message.getMessageHash(), message.timestamp, message.messageType);

        for(let neighbor of this.getNeighbors()) {
            let result = await fetch(`http://localhost:`+ neighbor.port + '/broadcast-message', {
                method: 'POST',
                body: JSON.stringify(message),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            await result.text();
        }
    }

    async askNeighboursForBlockchain(): Promise<Blockchain[]> {
        let blockchains: Blockchain[] = [];
        for(let neighbor of this.getNeighbors()) {
            let blockchain = await this.askNeighborForBlockchain(neighbor.port);
            blockchains.push(blockchain);
        }
        return blockchains;
    }

    async askNeighborForBlockchain(port: number): Promise<Blockchain> {
        let blockchain = new Blockchain();
        let result = await fetch(`http://localhost:`+ port + '/get-blocks');
        blockchain.loadFromJson(await result.json());

        return blockchain;
    }
}