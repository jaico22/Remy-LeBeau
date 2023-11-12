import { Help } from "../Models/Help";
import { MessageProcessorResponse } from "../Models/MessageProcessorResponse";
import { User } from "../Models/User";
import { IMessageProcessor } from "./IMessageProcessor";

class HelpProcessor implements IMessageProcessor {
    private _helpDocuments : Help[];
    constructor(helpDocuments: Help[]) {
        this._helpDocuments = helpDocuments
    }
    
    helpDocument = {
        name: "Help",
        description: "Retrieve List of all Commands",
        pattern: "Remmy help",
    } as Help;

    patterns = ["Remy Help", "Remy, how do I use you?"]

    processMessageAsync = (message: string, user: User) => {
        let messages : string[] = [];
        if (message.toLocaleLowerCase() === "remy help") 
        {
            let docMessage : string = "Here are some of the commands available:";
            for (const helpDocument of this._helpDocuments)
            {
                docMessage = `${docMessage}\n\t*${helpDocument.name}* [${helpDocument.pattern}]: ${helpDocument.description} \n\t\t _e.g. ${helpDocument.example}_`
            }     
            messages.push(docMessage)       
        }

        return Promise.resolve({
            messages
        })
    }

}

export default HelpProcessor;