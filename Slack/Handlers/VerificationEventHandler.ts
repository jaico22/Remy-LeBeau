import { ISlackEventHandler } from "./ISlackEventHandler";
import { SlackEvent } from "../Models/SlackEvent";
import { SlackResponse } from "../Models/SlackResponse";
import { VerificationResponse } from "../Models/VerificationResponse";

class VerificationEventHandler implements ISlackEventHandler<VerificationResponse> {
    type = "url_verification";
    
    handleEventAsync = (request: SlackEvent) => {
        return Promise.resolve({
            statusCode: 200,
            body: {
                challenge: request.challenge
            }
        } as SlackResponse<VerificationResponse>);
    };
}

export default VerificationEventHandler;