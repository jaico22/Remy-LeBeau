import AliasProcessor from "../../Core/Processors/AliasProcessor";
import { IMessageProcessor } from "../../Core/Processors/IMessageProcessor";
import KarmaProcessor from "../../Core/Processors/KarmaProcessor";
import { User } from "../../Core/Models/User";
import { SlackPublisher } from "../../Core/Publishers/SlackPublisher";
import { ISlackEventHandler } from "./ISlackEventHandler";
import { SlackEvent } from "../Models/SlackEvent";
import { SlackMessageEvent } from "../Models/SlackMessageEvent";
import { SlackResponse } from "../Models/SlackResponse";
import HelpProcessor from "../../Core/Processors/HelpProcessor";
import GetKarmaProcessor from "../../Core/Processors/GetKarmaProcessor";
import MessageRouter from "../../Core/AI/MessageRouter";

class MessageEventHandler implements ISlackEventHandler<any>{
    private readonly _slackPublisher : SlackPublisher;

    constructor() {
        this._slackPublisher = new SlackPublisher();
    }

    type = "message";

    handleEventAsync = async (request: SlackEvent) => {
        if (!MessageRouter.isInitialized){
            console.log("initalizing message router")
            await MessageRouter.init();
        }
        if (!request.event){
            throw "Event cannot be null";
        }
        const messageEvent = request.event as SlackMessageEvent;

        const user = {
            userId: messageEvent.user,
            platform: "slack"
        } as User;

        if (messageEvent.bot_id){
            console.log("ignoring")
            return Promise.resolve({
                statusCode: 200
            } as SlackResponse<never>);
        }

        console.log(`Received message from user ${messageEvent.user}: "${messageEvent.text}"`);
        
        // Ignore blank messages and edits
        if (messageEvent.subtype === "message_changed" || !messageEvent.text)
        {
            console.log("Invalid message or edit received; Ignroing")
            return Promise.resolve({
                statusCode: 200
            } as SlackResponse<never>)
        }

        const responses = await MessageRouter.routeMessage(messageEvent.text, user);

        console.log(`Response from processor: ${responses.join(",")}`)

        this._slackPublisher.sendMessages(messageEvent.channel, responses);
        
        return {
            statusCode: 200,
        } as SlackResponse<never>
    };
}

export default MessageEventHandler;