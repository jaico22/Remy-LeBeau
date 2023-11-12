import { Help } from "../Models/Help";
import { MessageProcessorResponse } from "../Models/MessageProcessorResponse";
import { User } from "../Models/User";

export interface IMessageProcessor {
    helpDocument: Help;
    patterns: string[];
    processMessageAsync: (message: string, user: User) => Promise<MessageProcessorResponse>
}