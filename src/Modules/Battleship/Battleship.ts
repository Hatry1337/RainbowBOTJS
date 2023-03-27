import { Access, AccessTarget, Colors, EphemeralConfigEntry, Module, Synergy } from "synergy3";
import BattleshipGame from "./Game/BattleshipGame";
import { NewHandler } from "./Interactions/NewHandler";
import { InteractionRouter } from "../../Utils/Interactions/Router";
import { FieldShowHandler } from "./Interactions/FieldShowHandler";
import { FieldPlaceHandler } from "./Interactions/FieldPlaceHandler";
import { BattleShipDrawFieldSettings } from "./Game/BattleField";
import { BattleshipPlayer } from "./Game/BattleshipPlayer";
import Discord from "discord.js";
import { ReadyHandler } from "./Interactions/ReadyHandler";
import { FieldRemoveHandler } from "./Interactions/FieldRemoveHandler";
import { BombHandler } from "./Interactions/BombHandler";

export default class Battleship extends Module{
    public Name:        string = "Battleship";
    public Description: string = "This module adds Battleship Game";
    public Category:    string = "Game";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.PLAYER() ];
    public router: InteractionRouter<Battleship> = new InteractionRouter(this);

    public games: Map<string, BattleshipGame> = new Map();

    public configTheme: EphemeralConfigEntry<"string">;
    public configAppleFix: EphemeralConfigEntry<"bool">;

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);
        this.SlashCommands.push(
            this.bot.interactions.createSlashCommand(this.Name.toLowerCase(), this.Access, this, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
                .build(builder =>
                    builder
                        .setDescription(this.Description)
                        .addSubcommand(command =>
                            command
                                .setName("new")
                                .setDescription("Start new Battleship game.")
                                .addUserOption(option =>
                                    option
                                        .setName("player2")
                                        .setDescription("Second player to play with.")
                                        .setRequired(true)
                                )
                        )
                        .addSubcommand(command =>
                            command
                                .setName("ready")
                                .setDescription("Set ready state.")
                        )
                        .addSubcommand(command =>
                            command
                                .setName("bomb")
                                .setDescription("Bomb cell of your enemy.")
                                .addStringOption(option =>
                                    option
                                        .setName("position")
                                        .setDescription("Position of cell to bomb.")
                                        .setRequired(true)
                                )
                        )
                        .addSubcommandGroup(group =>
                            group
                                .setName("field")
                                .setDescription("Battle field settings.")
                                .addSubcommand(command =>
                                    command
                                        .setName("show")
                                        .setDescription("Show your battle field.")
                                )
                                .addSubcommand(command =>
                                    command
                                        .setName("place")
                                        .setDescription("Place ship on your battle field.")
                                        .addStringOption(option =>
                                            option
                                                .setName("position")
                                                .setDescription("Position where to place your ship")
                                                .setRequired(true)
                                        )
                                        .addIntegerOption(option =>
                                            option
                                                .setName("size")
                                                .setDescription("Ship size to place")
                                                .setMinValue(1)
                                                .setMaxValue(4)
                                                .setRequired(true)
                                        )
                                        .addStringOption(option =>
                                            option
                                                .setName("orientation")
                                                .setDescription("Orientation of ship to place")
                                                .addChoices(
                                                    { name: "vertical", value: "vertical" },
                                                    { name: "horizontal", value: "horizontal" },
                                                )
                                                .setRequired(true)
                                        )
                                )
                                .addSubcommand(command =>
                                    command
                                        .setName("remove")
                                        .setDescription("Remove ship from your battle field.")
                                        .addStringOption(option =>
                                            option
                                                .setName("position")
                                                .setDescription("Position where to place your ship")
                                                .setRequired(true)
                                        )
                                )
                        )
                )
                .onExecute(this.router.route.bind(this.router))
                .commit()
        );

        this.router.defineHandler(new NewHandler(), "new");
        this.router.defineHandler(new ReadyHandler(), "ready");
        this.router.defineHandler(new BombHandler(), "bomb");

        this.router.defineHandler(new FieldShowHandler(), "show", "field");
        this.router.defineHandler(new FieldPlaceHandler(), "place", "field");
        this.router.defineHandler(new FieldRemoveHandler(), "remove", "field");

        this.configTheme = this.bot.config.defaultConfigEntry("user", this.Name, new EphemeralConfigEntry(
           "bs_theme",
           `Battleship board visual theme ("light", "dark")`,
           "string",
           false
        ));
        this.configAppleFix = this.bot.config.defaultConfigEntry("user", this.Name, new EphemeralConfigEntry(
            "bs_apple-fix",
            `Battleship board emojis fix on Apple devices`,
            "bool",
            false
        ));
    }

    public getBoardSettings(userId: string) {
        let appleFix = this.configAppleFix.getValue(userId);
        let theme = this.configTheme.getValue(userId);
        let boardSettings: Required<BattleShipDrawFieldSettings> = {
            emptySymbol:       theme === "light" ? "◻️" : "◼️",
            shipSymbol:        "🟪",
            emptyBombedSymbol: theme === "light" ? "🔹" : "🔸",
            shipBombedSymbol:  "💥",
            abcdefghij:        appleFix ? "🇦 🇧 🇨 🇩 🇪 🇫 🇬 🇭 🇮 🇯" : "🇦**🇧**🇨**🇩**🇪**🇫**🇬**🇭**🇮**🇯**",
            columnSpace:       appleFix ?? false,
        }
        return boardSettings;
    }

    public drawBoard(player: BattleshipPlayer) {
        let boardSettings = this.getBoardSettings(player.user.discordId);
        let fieldPlayer = player.field.draw(boardSettings);
        let fieldEnemy = player.enemyField.draw(boardSettings);

        let player1 = player.game.players[0];
        let player2 = player.game.players[1];

        let embed = new Discord.EmbedBuilder({
            title: "Battleship",
            description:    `Game Stage: **${player.game.gameStage}**\n\n` +
                            `Player 1 [${player1.isReady ? "✅" : "❌"}]: <@${player1.user.discordId}>\n` +
                            `Player 2 [${player2.isReady ? "✅" : "❌"}]: <@${player2.user.discordId}>\n\n` +
                            `Current Move: <@${player.game.currentPlayer.user.discordId}>`,
            color: Colors.Noraml
        });

        embed.addFields(
            { name: "Your Battle Field", value: fieldPlayer, inline: true },
            { name: "Enemy Battle Field", value: fieldEnemy, inline: true }
        );

        return embed;
    }

    public async Init() {

    }

    public async UnLoad() {
    }
}