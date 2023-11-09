import { IEvent } from "./IEvent"

export type SlackEvent = {
    type: string,
    challenge?: string
    event?: IEvent
}