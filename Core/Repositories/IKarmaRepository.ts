import { KarmaBlob } from "../Models/KarmaBlob";

export interface IKarmaRepository {
    getKarma: (word: string) => Promise<KarmaBlob>;
    setKarma: (word: string, blob: KarmaBlob) => Promise<void>;
}