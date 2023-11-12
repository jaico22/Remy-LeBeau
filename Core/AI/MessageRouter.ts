import { User } from "../Models/User";
import AliasProcessor from "../Processors/AliasProcessor";
import GeneralChatProcessor from "../Processors/GeneralChatProcessor";
import GetKarmaProcessor from "../Processors/GetKarmaProcessor";
import HelpProcessor from "../Processors/HelpProcessor";
import { IMessageProcessor } from "../Processors/IMessageProcessor";
import KarmaProcessor from "../Processors/KarmaProcessor";
import EmbeddingsProcessor from "./Embeddings/EmbeddingsProcessor";
import { MessageRouterResponse } from "./Models/MessageRouterResponse";
import {dot, max} from "mathjs"

class MessageRouter {
    private readonly _processors : IMessageProcessor[];
    private readonly _embeddingsProcessor : EmbeddingsProcessor;
    private _processorMappings : {processor: IMessageProcessor, embeddings: number[]}[] = [];

    isInitialized: boolean;
 
    constructor() {
        this._processors = [
            new KarmaProcessor(),
            new AliasProcessor(),
            new GetKarmaProcessor()
        ]
        this._embeddingsProcessor = new EmbeddingsProcessor();
        this.isInitialized = false;
    }

    async init() {
        this._processorMappings = await this.generatePatternEmbeddings(this._processors);
        this.isInitialized = true;
    }

    async routeMessage(message: string, user : User){
        if (!message.toLocaleLowerCase().includes("remy") 
            && !message.toLocaleLowerCase().includes("++")
            && !message.toLocaleLowerCase().includes("--")
            && !message.toLocaleLowerCase().includes("karma")){
            return [];
        }
        const processorResponse = await this.getProcessorUsingEmbeddingsAsync(message);
        if (processorResponse.isSuccess && processorResponse.processor){
            console.log("Using AI")
            const response = await processorResponse.processor.processMessageAsync(message, user);
            return response.messages;
        }
        else {
            console.log("Using fallback")
            return await this.processMessageFallback(message, user);
        }
    }

    private async getProcessorUsingEmbeddingsAsync(message: string) : Promise<MessageRouterResponse> {
        try {
            console.log(`Message: ${message}`)
            const embeddings = await this._embeddingsProcessor.generateEmbeddings(message);
            console.log(`Mappings info: Count=${this._processorMappings.length}`)
            let processor : IMessageProcessor | undefined;
            let maxDotProduct = 0;
            for (const mapping of this._processorMappings){
                console.log(`Calculating dot product"`)
                try{
                    const dotProduct = dot(embeddings.embeddings, mapping.embeddings);
                    if (dotProduct >= (mapping.processor.minimumScore ?? 0.0) 
                        && dotProduct > maxDotProduct)
                    {
                        maxDotProduct = dotProduct;
                        processor = mapping.processor
                    }
                    console.log(`${mapping.processor.helpDocument.name}: ${dotProduct}`)
                }
                catch(ex) {
                    console.error(ex)
                }
            }

            return {
                isSuccess: maxDotProduct > 0.8,
                processor
            }
        }
        catch {
            return {
                isSuccess: false
            }
        }
    }

    private async processMessageFallback(message: string, user: User) : Promise<string[]>{
        let responses : string[] = [];
        for (const processor of this._processors)
        {
            const newResponses = await processor.processMessageAsync(message, user);
            responses = responses.concat(newResponses.messages);
        }
        return responses;
    }

    private async generatePatternEmbeddings(processors : IMessageProcessor[]) {
        console.log("Initializing AI Models")
        let processorVectors : {processor: IMessageProcessor, embeddings: number[]}[] = [];
        try {
            for (const processor of processors){
                for (const pattern of processor.patterns){
                    const completedPatern = pattern.replace("{0}", "Phil")
                    const embedding = await this._embeddingsProcessor.generateEmbeddings(completedPatern);
                    processorVectors.push({
                        processor,
                        embeddings: embedding.embeddings
                    })
                }
            }
        } catch(ex) {
            console.error(ex);
            console.error("An error occurred generating embeddings")
        }

        return processorVectors;
    }
}

export default new MessageRouter();