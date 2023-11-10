class KarmaParser {
    private _delimiter: string;
    
    constructor(delimiter: string){
        this._delimiter = delimiter;
    }

    parseKarma(text: string) : string[] {
        const regex = new RegExp(`(?:\\([^)]*\\)|\\S)+\\${this._delimiter}`, "g");
        const matches = text.match(regex);
        let result : string[] = [];
        if (matches) {
            result = matches.map(match => {
                const matchWithoutDelimiter = match.replace(this._delimiter, "");
                const strippedString =  matchWithoutDelimiter.replace(/[()]/g, "");
                return strippedString;
            }).filter(matches => matches && matches !== "");
        } 
        return result;  
    }
}

export default KarmaParser;