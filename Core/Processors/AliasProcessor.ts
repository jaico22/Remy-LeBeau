import { IKarmaRepository } from "../Repositories/IKarmaRepository";
import { IMessageProcessor } from "./IMessageProcessor";
import { KarmaBlob } from "../Models/KarmaBlob";
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
        let messages : string[] = [];
        const alias = this.extractAlias(message.toLocaleLowerCase());
        if (alias)
        {
            const userId = this.buildUserIdentifier(user);
            const userKarma = await this._karmaRepository.getKarma(userId);

            const userAliases = user.platform === "slack"
                ? userKarma.slackAliases
                : userKarma.discordAliases;

            // Users cannot have multiple aliases
            if (userAliases && userAliases.length > 0) {
                messages.push(`You can't have more than one alias.`)
            }
            else {
                const aliasKarma = await this._karmaRepository.getKarma(userId);

                // Values cannot have multiple aliases
                const aliasAliases = user.platform === "slack"
                    ? aliasKarma.slackAliases
                    : aliasKarma.discordAliases
                if (aliasAliases && aliasAliases?.length > 0){
                    messages.push(`${alias} is already aliased to someone else`)
                }

                // Track alias updates on both the target and the user to prevent having to query
                // which is currently not that feasible with a blob approach to data storage
                this.appendAlias(aliasKarma, userId, user.platform);
                this.appendAlias(userKarma, alias, user.platform);
                await this._karmaRepository.setKarma(userId, userKarma);
                await this._karmaRepository.setKarma(alias, aliasKarma);
                
                messages.push(`Hey there ${alias}!`)
            }
        }

        return {
            messages
        } 
    }

    private appendAlias(aliasKarma: KarmaBlob, alias: string, platform: "slack" | "discord") {
        if (platform === "discord")
        {
            if (!aliasKarma.discordAliases) {
                aliasKarma.discordAliases = [];
            }
            aliasKarma.discordAliases.push(alias);
        }
        else {
            if (!aliasKarma.slackAliases) {
                aliasKarma.slackAliases = [];
            }
            aliasKarma.slackAliases.push(alias);         
        }
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