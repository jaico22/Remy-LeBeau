import { Request, Response } from "express";
import { ParsedQs } from "qs";
import { IController, Method } from "../Core/IController";
import { SlackEvent } from "./Models/SlackEvent";
import { ISlackEventHandler } from "./ISlackEventHandler";
import VerificationEventHandler from "./VerificationEventHandler";
import { SlackResponse } from "./Models/SlackResponse";
import MessageEventHandler from "./MessageEventHandler";

class SlackController implements IController {

    constructor() {
        this._handlers.push(new VerificationEventHandler())
        this._handlers.push(new MessageEventHandler())
    }

    Endpoints = [
        {
            Handler: async (req: Request<SlackEvent>, res: Response<number, Record<string, any>>) => {
                console.log('received');
                console.log(req.body);
                const slackEvent = req.body as SlackEvent;
                let slackResponse : SlackResponse<any> | null = null;
                for (const handler of this._handlers) {
                    if (slackEvent.type === handler.type || (slackEvent.event && slackEvent.event.type === handler.type)){
                        slackResponse = await handler.handleEventAsync(slackEvent);
                    }
                };
                if (slackResponse){
                    res.status(slackResponse.statusCode);
                    res.send(slackResponse.body);
                }
            },
            Path: "/slack/event",
            Method: Method.POST
        }
    ]

    _handlers : ISlackEventHandler<any>[] = [];
}

export default new SlackController();