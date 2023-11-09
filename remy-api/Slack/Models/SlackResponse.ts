export type SlackResponse<T> = {
    statusCode: number;
    body: T;
}