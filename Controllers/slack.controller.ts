import { Request, Response } from "express";
import { IController, Method } from "../Core/IController";
import { SlackEvent } from "../Slack/Models/SlackEvent";
import { ISlackEventHandler } from "../Slack/Handlers/ISlackEventHandler";
import VerificationEventHandler from "../Slack/Handlers/VerificationEventHandler";
import { SlackResponse } from "../Slack/Models/SlackResponse";
import MessageEventHandler from "../Slack/Handlers/MessageEventHandler";

class SlackController implements IController {

    constructor() {
        this._handlers.push(new VerificationEventHandler())
        this._handlers.push(new MessageEventHandler())
    }

    Endpoints = [
        {
            Handler: async (req: Request<SlackEvent>, res: Response<number, Record<string, any>>) => {
                console.log('Slack Event Received');
                const slackEvent = req.body as SlackEvent;
                let slackResponse : SlackResponse<any> | null = null;
                console.log(req.body)
                for (const handler of this._handlers) {
                    if (slackEvent.type === handler.type || (slackEvent.event && slackEvent.event.type === handler.type)){
                        if (handler.type !== "url_verification"){
                            res.status(200);
                            res.send();
                        }
                        slackResponse = await handler.handleEventAsync(slackEvent);
                        if (handler.type === "url_verification"){
                            res.status(slackResponse.statusCode);
                            res.send(slackResponse.body);
                        }
                    }
                };
                res.status(400);
                res.send();
            },
            Path: "/slack/event",
            Method: Method.POST
        }
    ]

    _handlers : ISlackEventHandler<any>[] = [];
}

export default new SlackController();