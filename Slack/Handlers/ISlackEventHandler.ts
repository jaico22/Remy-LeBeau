import { SlackResponse } from "../Models/SlackResponse";
import { SlackEvent } from "../Models/SlackEvent";

export interface ISlackEventHandler<T> {
    type: string;
    handleEventAsync: (request: SlackEvent) => Promise<SlackResponse<T>>;
}