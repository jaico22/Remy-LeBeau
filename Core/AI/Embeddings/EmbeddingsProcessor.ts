import OpenAI from "openai";
import { EmbeddingsProcessorResponse } from "./Models/EmbeddingsProcessorResponse";

class EmbeddingsProcessor {
    private readonly _client : OpenAI;
    constructor(){
        this._client = new OpenAI({
            apiKey: process.env.OPENAIKEY
        })
    }
    generateEmbeddings = async (message: string) => { 
        const embeddingsResponse = await this._client.embeddings.create({
            model: "text-embedding-ada-002",
            input: message
        });
        return {
            embeddings: embeddingsResponse.data[0].embedding
        } as EmbeddingsProcessorResponse;
    } 
}

export default EmbeddingsProcessor;