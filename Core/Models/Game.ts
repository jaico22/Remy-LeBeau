import { ChatMessage } from "../AI/Chat/Models/ChatMessage";

export class Game {
    constructor(userId: string) {
        this.userId = userId;
        this.messages = []
    }

    addMessage(role: "remy" | "user", message: string){
        var largestOrder = this.messages.sort(m => m.order ?? 0).reverse()[0]?.order ?? 0;
        this.messages.push({
            message,
            role,
            order: largestOrder + 1
        })
    }

    userId: string;
    messages: ChatMessage[];
}