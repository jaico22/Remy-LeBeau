import { Request, Response } from "express";
import { ParsedQs } from "qs";
import { IController, Method } from "../Core/IController";

class UpdateKarmaController implements IController{
    Endpoints = [
        {
            Handler: (req: Request<number, any, any, ParsedQs, Record<string, any>>, res: Response<number, Record<string, any>>) => {
                console.log("hello World")
            },
            Path: "/karma/{userId}",
            Method: Method.POST
        }
    ]
}

export default new UpdateKarmaController();