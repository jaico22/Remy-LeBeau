import { Request, Response } from "express";

export enum Method {
    GET = 1,
    POST = 2,
    PUT = 3
}

export interface Endpoint<TRequest, TResponse>  {
    Path: string
    Method: Method
    Handler: (req: Request<TRequest>, res: Response<TResponse>) => void;
}

export interface IController{
    Endpoints: Endpoint<any, any>[]

}