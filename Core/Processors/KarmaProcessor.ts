import { IKarmaRepository } from "../Repositories/IKarmaRepository";
import { IMessageProcessor } from "./IMessageProcessor";
import KarmaParser from "../Helpers/KarmaParser";
import { MessageProcessorResponse } from "../Models/MessageProcessorResponse";
import { User } from "../Models/User";
import S3KarmaRepository from "../Repositories/S3KarmaRepository";
import { Help } from "../Models/Help";

class KarmaProcessor implements IMessageProcessor {
    private readonly _incrementParser : KarmaParser;
    private readonly _decrementParser : KarmaParser;
    private readonly _repository : IKarmaRepository;
    constructor() {
        this._incrementParser = new KarmaParser("++");
        this._decrementParser = new KarmaParser("--");
        this._repository = S3KarmaRepository;
    }
    
    helpDocument = {
        name: "Add or Remove Karma",
        description: "Adds or Removes karma from something",
        pattern:  "{0}++ or {0}--",
        example: "poop++"
    } as Help

    processMessageAsync = async (message: string, _user: User) : Promise<MessageProcessorResponse> => {
        const increments = this._incrementParser.parseKarma(message);
        const decrements = this._decrementParser.parseKarma(message);
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