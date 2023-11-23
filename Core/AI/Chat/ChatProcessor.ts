import OpenAI from "openai";
import { ChatProcessorRequest } from "./Models/ChatProcessorRequest";
import { ChatCompletionMessageParam } from "openai/resources";

class ChatProcessor {
    private readonly _client : OpenAI;

    constructor(){
        this._client = new OpenAI({apiKey: process.env.OPENAIKEY});
    }

    async generateResponse(request : ChatProcessorRequest) : Promise<string | null> {
        const messages = (request.systemPrompts ?? []).map(p => ({
                role: "system",
                content: p
            }) as ChatCompletionMessageParam)
            .concat(request.userPrompts.sort(p => p.order ?? 0).map(p => ({
                role: p.role ?? "user",
                content: p.message
            } as ChatCompletionMessageParam)));

        const response = await this._client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: request.temperature
        })
        return response.choices[0].message.content;
    }
}

export default ChatProcessor;