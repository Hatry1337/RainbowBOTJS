import { Access, AccessTarget, Module, Synergy } from "synergy3";
import Discord from "discord.js";

export default class Battleship extends Module{
    public Name:        string = "Battleship";
    public Description: string = "This module adds Battleship Game";
    public Category:    string = "Game";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.PLAYER() ];

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);
        this.SlashCommands.push(
            this.bot.interactions.createSlashCommand(this.Name.toLowerCase(), this.Access, this, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
                .build(builder => builder
                    .setDescription(this.Description)
                    .addSubcommand(opt => opt
                        .setName("new")
                        .setDescription("Start new Battleship game.")
                        .addUserOption(opt => opt
                            .setName("player2")
                            .setDescription("Second player to play with.")
                        )
                    )
                )
                .onExecute(this.interactionRouter.bind(this))
                .commit()
        );
    }

    public async interactionRouter(interaction: Discord.ChatInputCommandInteraction) {

    }

    public async Init() {

    }

    public async UnLoad() {
    }
}