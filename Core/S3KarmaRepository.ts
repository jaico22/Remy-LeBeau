import { createHash } from "crypto";
import { IKarmaRepository } from "./IKarmaRepository";
import { KarmaBlob } from "./Models/KarmaBlob";
import { S3Client, ListBucketsCommand, PutObjectCommand, GetObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";

class S3KarmaRepository implements IKarmaRepository {
    private _client: S3Client;
    constructor() {
        this._client = new S3Client({ region: "us-east-2", credentials: {
            accessKeyId: process.env.AWSKEY as string,
            secretAccessKey: process.env.AWSSECRET as string
        } });
    }

    _hashWord = (word: string) => {
        return createHash('sha256').update(word).digest('hex');
    }
    
    getKarma = async (word: string) => {
        const input = {
            "Bucket": "remy-karma",
            "Key": this._hashWord(word),
        };
        const command = new GetObjectCommand(input);
        try {
            var resp = await this._client.send(command);
            var body = await resp.Body?.transformToString();
            if (body){
                return JSON.parse(body) as KarmaBlob;
            }
            else {
                return {
                    karma: 0
                } as KarmaBlob
            }
        }
        catch (ex) {
            console.error(ex);
            return {
                karma: 0
            };
        }
    }
    setKarma = async (word: string, blob: KarmaBlob) => {
        const input = {
            "Body": JSON.stringify(blob),
            "Bucket": "remy-karma",
            "Key": this._hashWord(word),
            "ServerSideEncryption": "AES256",
        } as PutObjectCommandInput;
        const command = new PutObjectCommand(input);
        await this._client.send(command);
    }
}

export default new S3KarmaRepository();