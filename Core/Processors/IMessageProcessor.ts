import { Help } from "../Models/Help";
import { MessageProcessorResponse } from "../Models/MessageProcessorResponse";
import { User } from "../Models/User";

export interface IMessageProcessor {
    helpDocument: Help;
    patterns: string[];
    minimumScore?: number;
    processMessageAsync: (message: string, user: User, aiEnabled: boolean) => Promise<MessageProcessorResponse>
}