import { IKarmaRepository } from "../Repositories/IKarmaRepository";
import { IMessageProcessor } from "./IMessageProcessor";
import KarmaParser from "../Helpers/KarmaParser";
import { MessageProcessorResponse } from "../Models/MessageProcessorResponse";
import { User } from "../Models/User";
import S3KarmaRepository from "../Repositories/S3KarmaRepository";
import { Help } from "../Models/Help";
import MessageParser from "../AI/MessageParser";

class KarmaProcessor implements IMessageProcessor {
    private readonly _incrementParser : KarmaParser;
    private readonly _decrementParser : KarmaParser;
    private readonly _repository : IKarmaRepository;
    private readonly _aiParser : MessageParser;

    patterns = ["{0}++", 
        "{0}--", 
        "Remy give karma to {0}", 
        "Give karma to {0}", 
        "Remy take karam from {0}", 
        "Take karama away from {0}", 
        "Take away karma from {0}"];

    constructor() {
        this._incrementParser = new KarmaParser("++");
        this._decrementParser = new KarmaParser("--");
        this._repository = S3KarmaRepository;
        this._aiParser = new MessageParser(this.patterns, "\"({0} increment) or ({0} decrement)");
    }
    
    helpDocument = {
        name: "Add or Remove Karma",
        description: "Adds or Removes karma from something",
        pattern:  "{0}++ or {0}--",
        example: "poop++"
    } as Help


    processMessageAsync = async (message: string, _user: User, aiEnabled: boolean) : Promise<MessageProcessorResponse> => {
        let increments : string[] = [];
        let decrements  : string[] = [];
        increments = this._incrementParser.parseKarma(message);
        decrements = this._decrementParser.parseKarma(message);
        try {
            if ((!increments || increments.length === 0 )
                && (!decrements || decrements.length === 0)
                && aiEnabled)
            console.log("Using AI")
            const resp = await this._aiParser.parseMessage(message);
            console.log(resp);
            const parts = resp?.replace("\"", "").replace(".", "")?.split(" ");
            console.log(JSON.stringify(parts))
            if (parts && parts[1] === "increment"){
                increments = [parts[0]]
            }
            else if (parts && parts[1] === "decrement"){
                decrements = [parts[0]]
            }
        }
        catch {
            console.log("Falling back")

        }

        console.log(`Increments: ${increments.join(', ')}`)
        console.log(`Decrements: ${decrements.join(', ')}`)
        const messages : string[] = [];
        for (const increment of increments){
            let karma = await this._repository.getKarma(increment);
            karma.karma++;
            await this._repository.setKarma(increment, karma);
            messages.push(`Gave karma to ${increment}. ${increment} now has ${karma.karma} karma`)
        }
        for (const decrement of decrements){
            let karma = await this._repository.getKarma(decrement);
            karma.karma--;
            await this._repository.setKarma(decrement, karma);
            messages.push(`Took karma from ${decrement}. ${decrement} now has ${karma.karma} karma`)
        }
        return Promise.resolve({
            messages
        });
    }
}

export default KarmaProcessor;