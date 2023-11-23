import ChatProcessor from "./Chat/ChatProcessor";
import { ChatProcessorRequest } from "./Chat/Models/ChatProcessorRequest";

class MessageParser {
    private _patterns: string[];
    private readonly _responseFormat: string;
    
    private readonly _chatProcessor : ChatProcessor;

    constructor(patterns: string[], responseFormat: string){
        this._patterns = patterns;
        this._chatProcessor = new ChatProcessor();
        this._responseFormat = responseFormat;
    }
    async parseMessage(message: string) : Promise<string | null>{
        let request : ChatProcessorRequest = {
            systemPrompts: [
                "Your job is to parse the users message according to the instructions provided.",
                `The patterns you may match against are ${this._patterns.join(", ")}`,
                `You may only respond with the format ${this._responseFormat} but you must remove all parenthesis from the response.`,
                `You may not return anything besides messages with that format.`
            ],
            userPrompts: [{message}],
            temperature: 0.01
        }
        return await this._chatProcessor.generateResponse(request);
    }
}

export default MessageParser;