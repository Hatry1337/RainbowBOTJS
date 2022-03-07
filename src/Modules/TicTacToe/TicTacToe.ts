import Discord, { ButtonInteraction, InteractionReplyOptions, Message, MessageActionRow, MessageButton } from "discord.js";
import { Utils, Emojis, Colors, CustomMessageSettings } from "../../Utils";
import Module from "../Module";
import ModuleManager from "../../ModuleManager";
import { SlashCommandBuilder } from "@discordjs/builders";
import TicTacToeGame, { TicTacToePlayer, TicTacToeSymbol } from "./TicTacToeGame";

export default class TicTacToe extends Module{
    public Name:        string = "TicTacToe";
    public Usage:       string = "Play Tic Tac toe game.";

    public Description: string = "Using this command users can play Tic Tac toe game.";
    public Category:    string = "Game";
    public Author:      string = "Thomasss#9258";

    private TicTacToeGames: Map<string, TicTacToeGame> = new Map();

    constructor(Controller: ModuleManager, UUID: string) {
        super(Controller, UUID);
        this.SlashCommands.push(
            new SlashCommandBuilder()
                .setName(this.Name.toLowerCase())
                .setDescription(this.Description)
                .addSubcommand(opt => opt
                    .setName("new")
                    .setDescription("Start new Tic Tac toe game in this channel.")
                    .addUserOption(opt => opt
                        .setName("player2")
                        .setDescription("Second player to play with you.")  
                    )
                    .addStringOption(opt => opt
                        .setName("ai_level")
                        .setDescription("How smart is AI.")
                        .addChoice("Easy", "easy")
                        .addChoice("Medium", "medium")
                        .addChoice("Hard", "hard")  
                        .addChoice("Insane", "expert")  
                    )
                )
                .addSubcommand(opt => opt
                    .setName("ai_ai")
                    .setDescription("Start new Tic Tac toe game between two AI players.")
                    .addStringOption(opt => opt
                        .setName("ai1_level")
                        .setDescription("How smart is AI 1.")
                        .setRequired(true)
                        .addChoice("Easy", "easy")
                        .addChoice("Medium", "medium")
                        .addChoice("Hard", "hard")  
                        .addChoice("Insane", "expert")  
                    )
                    .addStringOption(opt => opt
                        .setName("ai2_level")
                        .setDescription("How smart is AI 2.")
                        .setRequired(true)
                        .addChoice("Easy", "easy")
                        .addChoice("Medium", "medium")
                        .addChoice("Hard", "hard")  
                        .addChoice("Insane", "expert")  
                    )
                )
                .addSubcommand(opt => opt
                    .setName("cancel")
                    .setDescription("Cancel current game.")
                ) as SlashCommandBuilder
        );
    }
    
    
    public async Init(){
        this.Controller.bot.PushSlashCommands(this.SlashCommands, process.env.NODE_ENV === "development" ? process.env.MASTER_GUILD : "global");
    }
    
    public Test(interaction: Discord.CommandInteraction){
        return interaction.commandName.toLowerCase() === this.Name.toLowerCase();
    }

    private async buttonEvent(interaction: ButtonInteraction){
        let args = interaction.customId.split("-");
        let gm = this.TicTacToeGames.get(interaction.channelId);
        if(!gm || gm.isGameEnded){
            this.Controller.bot.events.ButtonEventUnSubscribe(interaction.customId);
            return;
        }
        let player;
        if(gm.player1.user?.id === interaction.user.id){
            player = gm.player1;
        }else if(gm.player2.user?.id === interaction.user.id){
            player = gm.player2;
        }else{
            return;
        }
        gm.makeMove(player, parseInt(args[3]));
        if(gm.isGameEnded){
            await interaction.update(this.makeResultMessage(gm));
        }else{
            await interaction.update(this.makeMessage(gm));
        }
    }

    private makeMessage(game: TicTacToeGame): InteractionReplyOptions{
        let embd = new Discord.MessageEmbed({
            title: `Tic Tac Toe Game`,
            description: 
                `${game.player1.symbol === "cross" ? "❌" : "⭕"} Player1: ${game.player1.user || `**AI (${game.player1.aiLvl})**`}\n` + 
                `${game.player2.symbol === "cross" ? "❌" : "⭕"} Player2: ${game.player2.user || `**AI (${game.player2.aiLvl})**`}\n` +
                `Current Move: ${game.currentMove === "cross" ? "❌" : "⭕"}\n` + 
                "```" +
                `${game.drawField()}` +
                "```",
            color: Colors.Noraml
        });
        let compons: MessageActionRow[] = [];
        
        for(let i = 0; i < game.fieldSize; i++){
            let row = new MessageActionRow();
            let j = i * game.fieldSize;
            for(let s of game.field.slice(i * game.fieldSize, game.fieldSize + (i*game.fieldSize))){
                let btn_cid = `ttt-move-${game.interaction.channelId}-${j}`;
                row.addComponents(
                    new MessageButton()
                        .setCustomId(btn_cid)
                        .setLabel(s ? (s === "cross" ? "❌" : "⭕") : j.toString())
                        .setStyle("PRIMARY")
                        .setDisabled(s ? true : false)
                );
                this.Controller.bot.events.ButtonEventSubscribe(btn_cid, this.buttonEvent.bind(this));
                j++;
            }
            compons.push(row);
        }

        return { embeds: [embd], components: compons };
    }

    private makeResultMessage(game: TicTacToeGame): InteractionReplyOptions{
        let msg = "Game Over! ";
        let player = game.winner;
        if(player){
            msg += `Winner is ${player.user || `**AI (${player.aiLvl})**`}\n`;
        }else{
            msg += `No winners in this game.\n`
        }

        msg += 
            `Match Info:\n` +
            `${game.player1.symbol === "cross" ? "❌" : "⭕"} Player1: ${game.player1.user || `**AI (${game.player1.aiLvl})**`}\n` + 
            `${game.player2.symbol === "cross" ? "❌" : "⭕"} Player2: ${game.player2.user || `**AI (${game.player2.aiLvl})**`}\n` +
            `Timestamp: ${Utils.ts()}`;

        let embd_win = new Discord.MessageEmbed({
            title: `Tic Tac Toe Game`,
            description: msg,
            color: Colors.Noraml
        });
        return { embeds: [embd_win], components: [] };
    }

    private CreateNew(interaction: Discord.CommandInteraction){
        return new Promise<Discord.Message | void>(async (resolve, reject) => {
            if(this.TicTacToeGames.has(interaction.channelId)){
                let embd = new Discord.MessageEmbed({
                    title: `Tic Tac Toe Game`,
                    description: `This channel already have active game.`,
                    color: Colors.Warning
                });
                return resolve(await interaction.reply({ embeds: [embd], ephemeral: true }).catch(reject));
            }

            let user2 = interaction.options.getUser("player2");
            let ailvl = interaction.options.getString("ai_level") as "easy" | "medium" | "hard" | "expert" | null;

            if(user2 && user2.bot){
                let embd = new Discord.MessageEmbed({
                    title: `Tic Tac Toe Game`,
                    description: `You can't play with BOT user.`,
                    color: Colors.Warning
                });
                return resolve(await interaction.reply({ embeds: [embd], ephemeral: true }).catch(reject));
            }
            
            let symbol1: TicTacToeSymbol = Math.random() < 0.5 ? "circle" : "cross";
            let symbol2: TicTacToeSymbol = symbol1 === "cross" ? "circle" : "cross";

            let game = new TicTacToeGame(
                interaction,
                3,
                new TicTacToePlayer(symbol1, false, interaction.user),
                user2 ? new TicTacToePlayer(symbol2, false, user2) : new TicTacToePlayer(symbol2, true, undefined, ailvl ? ailvl : undefined)
            )

            game.on("move", async (player: TicTacToePlayer, pos: number) => {
                if(player.isAI()){
                    if(game.isGameEnded){
                        await game.interaction.editReply(this.makeResultMessage(game)).catch(this.Logger.Error);
                    }else{
                        await game.interaction.editReply(this.makeMessage(game)).catch(this.Logger.Error);
                    }
                }
            });

            game.on("game_over", async (player?: TicTacToePlayer) => {
                for(let i = 0; i < game.field.length; i++){
                    this.Controller.bot.events.ButtonEventUnSubscribe(`ttt-move-${game.interaction.channelId}-${i}`);
                }
                this.TicTacToeGames.delete(interaction.channelId);
            });

            this.TicTacToeGames.set(interaction.channelId, game);
            
            return resolve(await interaction.reply(this.makeMessage(game)).catch(reject));
        });
    }

    private CreateAI_AI(interaction: Discord.CommandInteraction){
        return new Promise<Discord.Message | void>(async (resolve, reject) => {
            if(this.TicTacToeGames.has(interaction.channelId)){
                let embd = new Discord.MessageEmbed({
                    title: `Tic Tac Toe Game`,
                    description: `This channel already have active game.`,
                    color: Colors.Warning
                });
                return resolve(await interaction.reply({ embeds: [embd], ephemeral: true }).catch(reject));
            }

            let ailvl1 = interaction.options.getString("ai1_level", true) as "easy" | "medium" | "hard" | "expert";
            let ailvl2 = interaction.options.getString("ai2_level", true) as "easy" | "medium" | "hard" | "expert";
            
            let symbol1: TicTacToeSymbol = Math.random() < 0.5 ? "circle" : "cross";
            let symbol2: TicTacToeSymbol = symbol1 === "cross" ? "circle" : "cross";

            let game = new TicTacToeGame(
                interaction,
                3,
                new TicTacToePlayer(symbol1, true, undefined, ailvl1),
                new TicTacToePlayer(symbol2, true, undefined, ailvl2),
            )

            game.on("move", async (player: TicTacToePlayer, pos: number) => {
                if(player.isAI()){
                    if(game.isGameEnded){
                        await game.interaction.editReply(this.makeResultMessage(game)).catch(this.Logger.Error);
                    }else{
                        await game.interaction.editReply(this.makeMessage(game)).catch(this.Logger.Error);
                    }
                }
            });

            game.on("game_over", async (player?: TicTacToePlayer) => {
                for(let i = 0; i < game.field.length; i++){
                    this.Controller.bot.events.ButtonEventUnSubscribe(`ttt-move-${game.interaction.channelId}-${i}`);
                }
                this.TicTacToeGames.delete(interaction.channelId);
            });

            this.TicTacToeGames.set(interaction.channelId, game);
            
            return resolve(await interaction.reply(this.makeMessage(game)).catch(reject));
        });
    }

    private CancelCurrent(interaction: Discord.CommandInteraction){
        return new Promise<Discord.Message | void>(async (resolve, reject) => {
            let game = this.TicTacToeGames.get(interaction.channelId);
            if(game){
                if(game.player1.user?.id === interaction.user.id || game.player2.user?.id === interaction.user.id){
                    let embd_canc = new Discord.MessageEmbed({
                        title: `Tic Tac Toe Game`,
                        description: `Game canceled by ${interaction.user}.`,
                        color: Colors.Error
                    });
                    await game.interaction.editReply({ embeds: [embd_canc], components: [] }).catch(this.Logger.Error);
                    this.TicTacToeGames.delete(interaction.channelId);

                    let embd = new Discord.MessageEmbed({
                        title: `Tic Tac Toe Game`,
                        description: `You successfully canceled Tic Tac Toe Game in this channel.`,
                        color: Colors.Noraml
                    });
                    return resolve(await interaction.reply({ embeds: [embd], ephemeral: true }).catch(reject));
                }else{
                    let embd = new Discord.MessageEmbed({
                        title: `Tic Tac Toe Game`,
                        description: `Only game members can cancel the game.`,
                        color: Colors.Warning
                    });
                    return resolve(await interaction.reply({ embeds: [embd], ephemeral: true }).catch(reject))
                }
            }else{
                let embd = new Discord.MessageEmbed({
                    title: `Tic Tac Toe Game`,
                    description: `There's no active Tic Tac Toe Games in this channel.`,
                    color: Colors.Warning
                });
                return resolve(await interaction.reply({ embeds: [embd], ephemeral: true }).catch(reject))
            }
        });
    }

    public Run(interaction: Discord.CommandInteraction){
        return new Promise<Discord.Message | void>(async (resolve, reject) => {
            let sub = interaction.options.getSubcommand();

            if(!sub){
                return resolve(await interaction.reply({ embeds: [new Discord.MessageEmbed({
                    title: `To start new Tic Tac Toe game in this channel use slash command "/${this.Name.toLowerCase()} new".`,
                    color: Colors.Warning
                })]}).catch(reject));
            }

            if(sub.toLowerCase() === "new"){
                return resolve(await this.CreateNew(interaction).catch(reject));
            }

            if(sub.toLowerCase() === "ai_ai"){
                return resolve(await this.CreateAI_AI(interaction).catch(reject));
            }

            if(sub.toLowerCase() === "cancel"){
                return resolve(await this.CancelCurrent(interaction).catch(reject));
            }
        });
    }
}