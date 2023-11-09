import KarmaParser from "../Core/KarmaParser";
import KarmaProcessor from "../Core/KarmaProcessor";
import { SlackPublisher } from "../Core/SlackPublisher";
import { ISlackEventHandler } from "./ISlackEventHandler";
import { SlackEvent } from "./Models/SlackEvent";
import { SlackMessageEvent } from "./Models/SlackMessageEvent";
import { SlackResponse } from "./Models/SlackResponse";

class MessageEventHandler implements ISlackEventHandler<any>{
    private readonly _karmaProcessor : KarmaProcessor;
    private readonly _slackPublisher : SlackPublisher;
    constructor() {
        this._karmaProcessor = new KarmaProcessor();
        this._slackPublisher = new SlackPublisher();
    }
    type = "message";
    handleEventAsync = async (request: SlackEvent) => {
        if (!request.event){
            throw "Event cannot be null";
        }
        const messageEvent = request.event as SlackMessageEvent;
        if (messageEvent.bot_id){
            console.log("ignoring")
            return Promise.resolve({
                statusCode: 200
            } as SlackResponse<never>);
        }
        console.log(`Received message from user ${messageEvent.user}: "${messageEvent.text}"`);
        var response = await this._karmaProcessor.processMessageAsync(messageEvent.text);
        console.log(`Response from processor: ${response.messages.join(",")}`)
        this._slackPublisher.sendMessages(messageEvent.channel, response.messages);
        return Promise.resolve({
            statusCode: 200,
        } as SlackResponse<never>);
    };
}

export default MessageEventHandler;