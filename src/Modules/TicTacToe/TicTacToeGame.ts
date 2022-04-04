import { CommandInteraction, User } from "discord.js";
import EventEmitter from "events";
import { InteractiveButton } from "rainbowbot-core/dist/InteractionsManager";
import ttt_ai, { HardAI } from "tictactoe-complex-ai";

export type TicTacToeSymbol = "cross" | "circle";

export class TicTacToePlayer{
    public ai?: HardAI;
    constructor(public symbol: TicTacToeSymbol, private isAi: boolean = true, public user?: User, public aiLvl: "easy" | "medium" | "hard" | "expert" = "hard") {
        if(this.isAi){
            this.ai = ttt_ai.createAI({ 
                level: this.aiLvl, 
                ai: this.symbol, 
                player: this.symbol === "cross" ? "circle" : "cross", 
                empty: null as unknown as string 
            }) as HardAI;
        }
    }

    public isAI(): boolean{
        return this.isAi;
    }
}

const WinLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

export default class TicTacToeGame extends EventEmitter{
    public player1: TicTacToePlayer;
    public player2: TicTacToePlayer;
    public move: number = 0;
    public currentMove: TicTacToeSymbol = "cross";
    public field: (TicTacToeSymbol | null)[] = new Array(9).fill(null);
    public isGameEnded: boolean = false;
    public controls: InteractiveButton[] = [];
    public winner?: TicTacToePlayer;

    constructor(public interaction: CommandInteraction, public fieldSize: number, player1: TicTacToePlayer, player2?: TicTacToePlayer){
        super();
        
        this.fieldSize = 3 //!!!!!!!!!!!!

        this.player1 = player1;
        player2 ? this.player2 = player2 : this.player2 = new TicTacToePlayer(player1.symbol === "cross" ? "circle" : "cross");

        if(this.player1.isAI() && this.currentMove === this.player1.symbol){
            this.player1.ai!.play(this.field.slice() as string[]).then(mv => {
                this.makeMove(this.player1, mv);
            });
        }else{
            if(this.player2.isAI() && this.currentMove === this.player2.symbol){
                this.player2.ai!.play(this.field.slice() as string[]).then(mv => {
                    this.makeMove(this.player2, mv);
                });
            }
        }

        this.on("move", (player: TicTacToePlayer, pos: number) => {
            let result = this.checkField();
            if(result){
                this.isGameEnded = true;
                this.winner = this.player1.symbol === result ? this.player1 : this.player2;
                this.emit("game_over", this.winner);
                return;
            }
            if(!this.field.includes(null)){
                this.isGameEnded = true;
                this.emit("game_over");
                return;
            }
            if(this.player1.isAI() && this.currentMove === this.player1.symbol){
                this.player1.ai!.play(this.field.slice() as string[]).then(mv => {
                    this.makeMove(this.player1, mv);
                });
            }else{
                if(this.player2.isAI() && this.currentMove === this.player2.symbol){
                    this.player2.ai!.play(this.field.slice() as string[]).then(mv => {
                        this.makeMove(this.player2, mv);
                    });
                }
            }
        });
    }

    public drawField(){
        let txtfield = `|`;

        let i = 0;
        while(i < this.fieldSize){
            txtfield += "-----|".repeat(this.fieldSize) + "\n|";
            let j = i * this.fieldSize;
            for(let s of this.field.slice(i * this.fieldSize, this.fieldSize + (i*this.fieldSize))){
                let symb = s ? (s === "cross" ? "❌" : "⭕") : j;
                let lng = symb.toString().length;
                if(s === "cross" || s === "circle"){
                    txtfield += ` ${symb}  |`;
                }else{
                    let spcs = (5 - lng) / 2;
                    txtfield += `${" ".repeat(Math.floor(spcs))}${symb}${" ".repeat(Math.ceil(spcs))}|`;
                }
                j++
            }
            txtfield += "\n|";
            i++;
        }
        txtfield += "-----|".repeat(this.fieldSize);
        return txtfield;
    }

    private checkField(){
        for (let l of WinLines) {
            const [a, b, c] = l;
            if (this.field[a] && this.field[a] === this.field[b] && this.field[a] === this.field[c]) {
                return this.field[a];
            }
        }
        return null;
    }

    public makeMove(player: TicTacToePlayer, pos: number): boolean{
        if(pos < 0 && pos > 8) return false;
        if(player.symbol === this.currentMove){
            this.field[pos] = player.symbol;
            this.currentMove = this.currentMove === "cross" ? "circle" : "cross";
            this.emit("move", player, pos);
            return true;
        }else{
            return false;
        }
    }
}