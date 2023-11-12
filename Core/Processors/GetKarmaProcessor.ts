import MessageParser from "../AI/MessageParser";
import { Help } from "../Models/Help";
import { MessageProcessorResponse } from "../Models/MessageProcessorResponse";
import { User } from "../Models/User";
import { IKarmaRepository } from "../Repositories/IKarmaRepository";
import S3KarmaRepository from "../Repositories/S3KarmaRepository";
import { IMessageProcessor } from "./IMessageProcessor";

class GetKarmaProcessor implements IMessageProcessor {
    private readonly _repository : IKarmaRepository;
    private readonly _aiParser : MessageParser;
    constructor() {
        this._repository = S3KarmaRepository;
        this._aiParser = new MessageParser(this.patterns, "{0}")
    }

    helpDocument = {
        name: "Get Karma",
        description: "Retrieves karma for given user",
        pattern: "karma {0}",
        example: "karma poop"
    } as Help

    patterns = ["how much karma does {0} have?", "karma {0}", "Remy, karma {0}"]

    processMessageAsync = async (message: string, user: User) => {
        let messages : string[] = [];

        let request : string | null = null;
        if (message.startsWith("karma")){
            request = this.extractRequest(message);
        }
        if (!request){
            request = await this._aiParser.parseMessage(message);
        }
        if (request) {
            const karma = await this._repository.getKarma(request);
            messages.push(`${request} currently has ${karma.karma} karma`)
        }

        return {
            messages
        }
    }

    private extractRequest(message: string): string | null {
        const regex = /karma\s(\w+)/i;
        const match = message.toLocaleLowerCase().replace("'", "").match(regex);
        
        if (match){
            const [, wordAfterHiRemyIm] = match;

            return wordAfterHiRemyIm;
        }
        return null
    }
}

export default GetKarmaProcessor;