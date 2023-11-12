import ChatProcessor from "../AI/Chat/ChatProcessor";
import { Help } from "../Models/Help";
import { MessageProcessorResponse } from "../Models/MessageProcessorResponse";
import { User } from "../Models/User";
import { IMessageProcessor } from "./IMessageProcessor";

class GeneralChatProcessor implements IMessageProcessor {
    private readonly _chatProcessor : ChatProcessor;
    constructor() {
        this._chatProcessor = new ChatProcessor();
    }

    helpDocument = {
        name: "Just Chatting",
        description: "Idk, go talk to the bot",
        pattern: "Hey Remy: ....",
        example: "Hey Remy: what do you think about Gambit"
    } as Help;
    patterns = ["Hey Remy!", "Good Morning Remy!", "Good Afternoon Remy"];

    async processMessageAsync(message: string, user: User, aiEnabled: boolean) : Promise<MessageProcessorResponse> {
        let responses : string[] = [];
        try {

        console.log("Sending a response request to chatgpt")
        const response = await this._chatProcessor.generateResponse({
            systemPrompts: ["You are Remy LeBeau. Please respond as Remy."],
            userPrompts: [message],
            temperature: 1.2
        });
        console.log(response);
        if (response)
            responses.push(response);
    }
    catch(ex){
        console.log("error")
        console.log(ex)
    }
        return {
            messages: responses
        }
    };
}

export default GeneralChatProcessor;