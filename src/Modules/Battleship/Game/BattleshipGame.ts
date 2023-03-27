import { BattleshipPlayer } from "./BattleshipPlayer";
import { User, Utils } from "synergy3";
import { GameNextMoveError, GameNextMoveErrorReason } from "./Errors/GameNextMoveError";
import { GameStartBattleError, GameStartBattleErrorReason } from "./Errors/GameStartBattleError";
import EventEmitter from "events";

export type BattleshipGameStage = "prepare" | "battle" | "finished";

const letterNumberRegEx = /([a-j])([1-9][0-9]?)/i;
const numberLetterRegEx = /([1-9][0-9]?)([a-j])/i;

declare interface BattleshipGame {
    on(event: 'started',      listener: () => void): this;
    on(event: 'stageChanged', listener: () => void): this;
    on(event: 'nextMove',     listener: () => void): this;
    on(event: 'finished',     listener: (winner: BattleshipPlayer) => void): this;
}

class BattleshipGame extends EventEmitter {
    public readonly players: BattleshipPlayer[] = [];

    private current_move: number = 0;
    private game_stage: BattleshipGameStage = "prepare";

    constructor() {
        super();
    }

    public static parseLiteralPos(pos: string) {
        let res = letterNumberRegEx.exec(pos);

        let letter: string;
        let number: number;
        if(!res) {
            res = numberLetterRegEx.exec(pos);
            if(!res) {
                return undefined;
            } else {
                letter = res[2];
                number = parseInt(res[1]);
            }
        } else {
            letter = res[1];
            number = parseInt(res[2]);
        }

        return { letter, number };
    }

    public static parseLiteralCords(pos: string) {
        let position = BattleshipGame.parseLiteralPos(pos);
        if(!position) {
            return undefined;
        }
        return {
            x: this.letterToNumber(position.letter),
            y: position.number
        }
    }

    public static letterToNumber(letter: string) {
        return letter.charCodeAt(0) - "a".charCodeAt(0) + 1;
    }

    public get currentPlayerIndex(): number {
        return this.current_move;
    }

    public get currentPlayer(): BattleshipPlayer {
        return this.players[this.current_move];
    }

    public get gameStage(): BattleshipGameStage {
        return this.game_stage;
    }

    public addPlayer(user: User) {
        let player = new BattleshipPlayer(user, this);
        this.players.push(player);
        return player;
    }

    public startBattle() {
        if(this.game_stage === "finished") {
            throw new GameStartBattleError(GameStartBattleErrorReason.GameAlreadyFinished);
        }
        this.game_stage = "battle";
        this.current_move = Utils.getRandomInt(0, this.players.length - 1);
        this.emit("started");
        this.emit("stageChanged");
    }

    public checkWin() {
        for(let p of this.players) {
            if(p.ships.filter(s => !s.isDestroyed()).length === 0) {
                return p;
            }
        }
    }

    public checkReady() {
        if(this.players.filter(p => p.isReady).length === this.players.length) {
            this.startBattle();
        }
    }

    public nextMove() {
        if(this.game_stage !== "battle") {
            throw new GameNextMoveError(GameNextMoveErrorReason.WrongGameStage);
        }

        let winner = this.checkWin();
        if(winner) {
            this.game_stage = "finished";
            this.emit("finished");
            this.emit("stageChanged");
            return;
        }

        this.current_move++;
        if(this.current_move >= this.players.length) {
            this.current_move = 0;
        }

        this.emit("nextMove");
    }
}

export default BattleshipGame;