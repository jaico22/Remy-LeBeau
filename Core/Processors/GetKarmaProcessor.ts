import { Help } from "../Models/Help";
import { MessageProcessorResponse } from "../Models/MessageProcessorResponse";
import { User } from "../Models/User";
import { IKarmaRepository } from "../Repositories/IKarmaRepository";
import S3KarmaRepository from "../Repositories/S3KarmaRepository";
import { IMessageProcessor } from "./IMessageProcessor";

class GetKarmaProcessor implements IMessageProcessor {
    private readonly _repository : IKarmaRepository;
    constructor() {
        this._repository = S3KarmaRepository;
    }

    helpDocument = {
        name: "Get Karma",
        description: "Retrieves karma for given user",
        pattern: "karma {0}",
        example: "karma poop"
    } as Help

    processMessageAsync = async (message: string, user: User) => {
        let messages : string[] = [];

        const request = this.extractRequest(message);
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