import { Game } from "../Models/Game";
import { User } from "../Models/User";

export interface IGameRepository {
    getGame(user: User) : Promise<Game | null>;
    saveGame(user: User, game: Game) : Promise<void>;
}