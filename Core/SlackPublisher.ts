import axios from "axios"

export class SlackPublisher {
    private _token: string | undefined;

    constructor() {
        this._token = process.env.TOKEN;

    }

    sendMessages(channel: string, messages: string[]){
        for (const message of messages)
        {
            axios.post("https://slack.com/api/chat.postMessage", {
                channel,
                text: message
            },{
                headers: {
                    Authorization: `Bearer ${this._token}`
                }
            })
        }
    }
}