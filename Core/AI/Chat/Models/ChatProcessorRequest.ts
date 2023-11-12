export type ChatProcessorRequest = {
    systemPrompts?: string[],
    userPrompts: string[],
    temperature?: number
}