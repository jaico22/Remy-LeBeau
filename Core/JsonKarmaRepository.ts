import { IKarmaRepository } from "./IKarmaRepository";
import fs from "fs";
import { createHash } from "crypto"
import { KarmaBlob } from "./Models/KarmaBlob";

class JsonKarmaRepositry implements IKarmaRepository {

    constructor() {
        if (!fs.existsSync("./karmaBlob")){
            fs.mkdirSync("./karmaBlob");
        }
    }
    _hashWord = (word: string) => {
        return createHash('sha256').update(word).digest('hex');
    }

    getKarma = (word: string) => {
        return new Promise<KarmaBlob>((resolve, reject) => {
            var hash = this._hashWord(word);
            const file = fs.readFile(`./karmaBlob/${hash}.json`, "utf8", (error, data) => {
                if (!error){
                    let karma = JSON.parse(data) as KarmaBlob;
                    resolve(karma);
                }
                resolve({
                    karma: 0
                } as KarmaBlob);
            });
        });
    }
    setKarma = (word: string, blob: KarmaBlob) => {
        return new Promise<void>((resolve, reject) => {
            var hash = this._hashWord(word);
            fs.writeFile(`./karmaBlob/${hash}.json`, JSON.stringify(blob), (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
}

export default JsonKarmaRepositry;