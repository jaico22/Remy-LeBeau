import { User } from "../../Core/Models/User";
import GeneralChatProcessor from "../../Core/Processors/GeneralChatProcessor";
import { SlackPublisher } from "../../Core/Publishers/SlackPublisher";
import { SlackEvent } from "../Models/SlackEvent";
import { SlackMessageEvent } from "../Models/SlackMessageEvent";
import { SlackResponse } from "../Models/SlackResponse";
import { ISlackEventHandler } from "./ISlackEventHandler";

class AppMentionEventHandler implements ISlackEventHandler<any> {
    type = "app_mention";
    private readonly _messageProcessor : GeneralChatProcessor;
    private readonly _slackPublisher : SlackPublisher;

    constructor() {
        this._messageProcessor = new GeneralChatProcessor();
        this._slackPublisher = new SlackPublisher();
    }

    async handleEventAsync(request: SlackEvent) {
        const messageEvent = request.event as SlackMessageEvent;
        const user = {
            userId: messageEvent.user,
            platform: "slack"
        } as User;
        // do not await, just let it run in the backtround
        this._messageProcessor.processMessageAsync(messageEvent.text, user, true).then((resp) => {
            this._slackPublisher.sendMessages(messageEvent.channel, resp.messages)
        });
        return Promise.resolve({
            statusCode: 200
        } as SlackResponse<never>);
    }
    
}

export default AppMentionEventHandler;