import { IKarmaRepository } from "./IKarmaRepository";
import JsonKarmaRepositry from "./JsonKarmaRepository";
import KarmaParser from "./KarmaParser";
import { KarmaProcessorResponse } from "./Models/KarmaProcessorResponse";
import S3KarmaRepository from "./S3KarmaRepository";

class KarmaProcessor {
    private readonly _incrementParser : KarmaParser;
    private readonly _decrementParser : KarmaParser;
    private readonly _repository : IKarmaRepository;
    constructor() {
        this._incrementParser = new KarmaParser("++");
        this._decrementParser = new KarmaParser("--");
        this._repository = S3KarmaRepository;
    }

    processMessageAsync = async (message: string) : Promise<KarmaProcessorResponse> => {
        const increments = this._incrementParser.parseKarma(message);
        const decrements = this._decrementParser.parseKarma(message);
        console.log(`Increments: ${increments.join(', ')}`)
        console.log(`Decrements: ${decrements.join(', ')}`)
        const messages : string[] = [];
        for (const increment of increments){
            let karma = await this._repository.getKarma(increment);
            karma.karma++;
            await this._repository.setKarma(increment, karma);
            messages.push(`Gave karama to ${increment}. ${increment} now has ${karma.karma} karma`)
        }
        for (const decrement of decrements){
            let karma = await this._repository.getKarma(decrement);
            karma.karma--;
            await this._repository.setKarma(decrement, karma);
            messages.push(`Took karama from ${decrement}. ${decrement} now has ${karma.karma} karma`)
        }
        return Promise.resolve({
            messages
        } as KarmaProcessorResponse);
    }
}

export default KarmaProcessor;