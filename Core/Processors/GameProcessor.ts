import ChatProcessor from "../AI/Chat/ChatProcessor";
import { Game } from "../Models/Game";
import { Help } from "../Models/Help";
import { MessageProcessorResponse } from "../Models/MessageProcessorResponse";
import { User } from "../Models/User";
import S3GameRepository from "../Repositories/GameRepository";
import { IGameRepository, } from "../Repositories/IGameRepository";
import { IMessageProcessor } from "./IMessageProcessor";

class GameProcess implements IMessageProcessor {

    private readonly _gameRepository : IGameRepository;
    private readonly _chatProcessor : ChatProcessor;

    constructor() {
        this._gameRepository = new S3GameRepository();
        this._chatProcessor = new ChatProcessor();
    }

    patterns = [
        "Remy, let's play a game"
    ]

    async processMessageAsync(message: string, user: User, aiEnabled: boolean) {
        let game = await this._gameRepository.getGame(user);
        if (!game) {
            game = new Game(user.userId);
        }
        game.addMessage("user", message);

        const response = await this.sendMessages(game);
        if (response){
            game.addMessage("remy", response);
        }

        await this._gameRepository.saveGame(user, game);

        return {
            messages: [response ?? ""],
        }
    }

    private async sendMessages(game: Game) : Promise<string | null> {
        const response = await this._chatProcessor.generateResponse({
            systemPrompts: ["You are Remy LeBeau. Please respond as Remy.", 
                "You are playing whatever game the user has defined.",
                "Please inform the user that the game will be live for 20 minutes on the first response"],
            userPrompts: game.messages.sort(m => m.order ?? 0),
            temperature: 1.2
        });
        return response;
    }
}

export default GameProcess;