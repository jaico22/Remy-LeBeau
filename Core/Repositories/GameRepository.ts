import { createHash } from "crypto";
import { IKarmaRepository } from "./IKarmaRepository";
import { KarmaBlob } from "../Models/KarmaBlob";
import { S3Client, PutObjectCommand, GetObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import { IGameRepository } from "./IGameRepository";
import { Game } from "../Models/Game";
import { User } from "../Models/User";

class S3GameRepository implements IGameRepository {
    private _client: S3Client;
    constructor() {
        this._client = new S3Client({ region: "us-east-2", credentials: {
            accessKeyId: process.env.AWSKEY as string,
            secretAccessKey: process.env.AWSSECRET as string
        } });
    }

    async getGame(user: User): Promise<Game | null> {
        const input = {
            "Bucket": "remy-games",
            "Key": this._hashWord(user.userId),
        };
        try {
            const command = new GetObjectCommand(input);
            var resp = await this._client.send(command);
            var body = await resp.Body?.transformToString();
            if (body){
                return JSON.parse(body) as Game;
            }
            else {
                return null;
            }
        }
        catch (ex) {
            return null;
        }
    }

    async saveGame(user: User, game: Game): Promise<void> {
        const input = {
            "Body": JSON.stringify(game),
            "Bucket": "remy-games",
            "Key": this._hashWord(user.userId),
            "ServerSideEncryption": "AES256",
            "Expires": new Date(Date.now() + (20 * 60 * 1000))
        } as PutObjectCommandInput;
        const command = new PutObjectCommand(input);
        await this._client.send(command);    
    }

    _hashWord = (word: string) => {
        var hash = `games-${process.env.ENV}${createHash('sha256').update(word.toLocaleLowerCase()).digest('hex')}`;
        console.log(`Key: ${hash}`);
        return hash;
    }

}

export default S3GameRepository;