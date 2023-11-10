import { IKarmaRepository } from "../Repositories/IKarmaRepository";
import { IMessageProcessor } from "./IMessageProcessor";
import { KarmaBlob } from "../Models/KarmaBlob";
import { MessageProcessorResponse } from "../Models/MessageProcessorResponse";
import { User } from "../Models/User";
import S3KarmaRepository from "../Repositories/S3KarmaRepository";
import { Help } from "../Models/Help";

class AliasProcessor implements IMessageProcessor {
    private readonly _karmaRepository : IKarmaRepository;
    constructor() {
        this._karmaRepository = S3KarmaRepository;
    }

    helpDocument = {
        name: "Alias User",
        description: "Sets up an alias for a user",
        pattern: "Hi Remy I'm {0}",
        example: "Hi Remy I'm Poop"
    } as Help
    
    processMessageAsync = async (message: string, user: User) => {
        const userId = this.buildUserIdentifier(user);
        const userKarma = await this._karmaRepository.getKarma(userId);
        const alias = this.extractAlias(message.toLocaleLowerCase());
        let messages : string[] = [];
        if (alias)
        {
            if (userKarma.aliases && userKarma.aliases.length > 0) {
                messages.push(`Don't lie to me ${userKarma.aliases.join(" or should I say ")}`)
            }
            else {
                const aliasKarma = await this._karmaRepository.getKarma(userId);

                if (aliasKarma.aliases && aliasKarma.aliases?.length > 0){
                    messages.push(`Nice try. That alias already belongs to someone else.`)
                }

                this.appendAlias(aliasKarma, userId);
                this.appendAlias(userKarma, alias);

                await this._karmaRepository.setKarma(userId, userKarma);
                await this._karmaRepository.setKarma(alias, aliasKarma);
                
                messages.push(`Hey there ${alias}!`)
            }
        }

        return {
            messages
        } 
    }

    private appendAlias(aliasKarma: KarmaBlob, alias: string) {
        if (!aliasKarma.aliases) {
            aliasKarma.aliases = [];
        }
        aliasKarma.aliases.push(alias);
    }

    private extractAlias(message: string): string | null {
        const regex = /hi remy im\s(\w+)/i;
        const match = message.replace("'", "").match(regex);
        
        if (match){
            const [, wordAfterHiRemyIm] = match;

            return wordAfterHiRemyIm;
        }
        return null
    }

    private buildUserIdentifier(user: User) : string {
        return `${user.platform}-${user.userId}`
    }
}

export default AliasProcessor;