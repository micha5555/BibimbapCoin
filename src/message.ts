import {createHash} from "node:crypto";

export enum MessageType {
    BLOCK = 'block',
    TEXT = 'text',
    TRANSACTION = 'transaction'
}

export class Message
{
    public timestamp: Date;
    public message: string;
    public messageType: MessageType

    constructor(timestamp: Date, message: string, messageType: MessageType)
    {
        this.timestamp = timestamp;
        this.message = message;
        this.messageType = messageType;
    }

    static recreateMessageJson(message: string): Message
    {
        let jsonMessage = JSON.parse(message);
        return new Message(jsonMessage.timestamp, jsonMessage.message, jsonMessage.messageType);
    }

    static recreateMessage(message: string, messageType: MessageType, timestamp: Date): Message
    {
        return new Message(timestamp, message, messageType);
    }

    static newMessage(message: string, messageType: MessageType): Message
    {
        return new Message(new Date(), message, messageType);
    }

    toJson() : string
    {
        return JSON.stringify(this);
    }

    getMessageHash(): string
    {
        return createHash("sha1").update(this.toJson()).digest("hex");
    }
}