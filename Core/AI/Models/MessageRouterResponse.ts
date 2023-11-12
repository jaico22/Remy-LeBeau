import { IMessageProcessor } from "../../Processors/IMessageProcessor";

export type MessageRouterResponse = {
    isSuccess: boolean;
    errorMessage?: string;
    processor?: IMessageProcessor;
}