import Discord from "discord.js";
import TicTacToeGame, { TicTacToePlayer, TicTacToeSymbol } from "./TicTacToeGame";
import { Access, AccessTarget, Colors, InteractiveComponent, Module, Synergy, Utils } from "synergy3";
export default class TicTacToe extends Module{
    public Name:        string = "TicTacToe";
    public Description: string = "Using this command users can play Tic Tac toe game.";
    public Category:    string = "Game";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.PLAYER() ];

    private TicTacToeGames: Map<string, TicTacToeGame> = new Map();

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);
        this.SlashCommands.push(
            this.bot.interactions.createSlashCommand(this.Name.toLowerCase(), this.Access, this, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
            .build(builder => builder
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
                        .addChoices({ name: "Easy", value: "easy" })
                        .addChoices({ name: "Medium", value: "medium" })
                        .addChoices({ name: "Hard", value: "hard" })
                        .addChoices({ name: "Insane", value: "expert" })
                    )
                )
                .addSubcommand(opt => opt
                    .setName("ai_ai")
                    .setDescription("Start new Tic Tac toe game between two AI players.")
                    .addStringOption(opt => opt
                        .setName("ai1_level")
                        .setDescription("How smart is AI 1.")
                        .setRequired(true)
                        .addChoices({ name: "Easy", value: "easy" })
                        .addChoices({ name: "Medium", value: "medium" })
                        .addChoices({ name: "Hard", value: "hard" })
                        .addChoices({ name: "Insane", value: "expert" })
                    )
                    .addStringOption(opt => opt
                        .setName("ai2_level")
                        .setDescription("How smart is AI 2.")
                        .setRequired(true)
                        .addChoices({ name: "Easy", value: "easy" })
                        .addChoices({ name: "Medium", value: "medium" })
                        .addChoices({ name: "Hard", value: "hard" })
                        .addChoices({ name: "Insane", value: "expert" })
                    )
                )
                .addSubcommand(opt => opt
                    .setName("cancel")
                    .setDescription("Cancel current game.")
                )
            )
            .onExecute(this.Run.bind(this))
            .commit()
        );
    }

    private async buttonEvent(interaction: Discord.ButtonInteraction, button: InteractiveComponent<Discord.MessageButton>, buttonNumber: number){
        let gm = this.TicTacToeGames.get(interaction.channelId);
        if(!gm || gm.isGameEnded){
            button.destroy();
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
        if(button.builder.label && !isNaN(parseInt(button.builder.label || ""))){
            gm.makeMove(player, parseInt(button.builder.label || "")); //FIXME: use buttonNumber instead of this hack, but something is wrong with callback.
        }
        if(gm.isGameEnded){
            await interaction.update(this.makeResultMessage(gm));
        }else{
            await interaction.update(this.makeMessage(gm));
        }
    }

    private makeMessage(game: TicTacToeGame): Discord.InteractionUpdateOptions & Discord.InteractionReplyOptions{
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
        let compons: Discord.MessageActionRow[] = [];
        
        for(let c of game.controls){
            c.destroy();
        }
        game.controls = [];
        
        let btn_access: AccessTarget[] = [];
        game.player1.user ? btn_access.push(Access.USER(game.player1.user.id)) : 0;
        game.player2.user ? btn_access.push(Access.USER(game.player2.user.id)) : 0;

        for(let i = 0; i < game.fieldSize; i++){
            let row = new Discord.MessageActionRow();
            let j = i * game.fieldSize;
            for(let s of game.field.slice(i * game.fieldSize, game.fieldSize + (i*game.fieldSize))){
                let button = this.bot.interactions.createButton(`${game.interaction.channelId}-btn${j}-tictactoe`, btn_access, this)
                .build(bld => bld
                    .setLabel(s ? (s === "cross" ? "❌" : "⭕") : j.toString())
                    .setStyle("PRIMARY")
                    .setDisabled(s ? true : false)
                )
                .onExecute((async int => await this.buttonEvent(int, button, j)));

                row.addComponents(button.builder);
                game.controls.push(button);
                j++;
            }
            compons.push(row);
        }

        return { embeds: [embd], components: compons };
    }

    private makeResultMessage(game: TicTacToeGame): Discord.InteractionUpdateOptions & Discord.InteractionReplyOptions{
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
        return new Promise<void>(async (resolve, reject) => {
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
                for(let c of game.controls){
                    c.destroy();
                }
                game.controls = [];
                this.TicTacToeGames.delete(interaction.channelId);
            });

            this.TicTacToeGames.set(interaction.channelId, game);
            
            return resolve(await interaction.reply(this.makeMessage(game)).catch(reject));
        });
    }

    private CreateAI_AI(interaction: Discord.CommandInteraction){
        return new Promise<void>(async (resolve, reject) => {
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
                for(let c of game.controls){
                    c.destroy();
                }
                game.controls = [];
                this.TicTacToeGames.delete(interaction.channelId);
            });

            this.TicTacToeGames.set(interaction.channelId, game);
            
            return resolve(await interaction.reply(this.makeMessage(game)).catch(reject));
        });
    }

    private CancelCurrent(interaction: Discord.CommandInteraction){
        return new Promise<void>(async (resolve, reject) => {
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
        return new Promise<void>(async (resolve, reject) => {
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