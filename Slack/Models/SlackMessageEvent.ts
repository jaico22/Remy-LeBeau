import { IEvent } from "./IEvent";

export interface SlackMessageEvent extends IEvent {
    user: string;
    text: string;
    channel: string;
    bot_id?: string;
}