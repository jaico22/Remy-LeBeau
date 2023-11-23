import { ChatMessage } from "./ChatMessage"

export type ChatProcessorRequest = {
    systemPrompts?: string[],
    userPrompts: ChatMessage[],
    temperature?: number
}