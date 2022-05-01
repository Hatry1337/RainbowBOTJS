import { Access, Colors, Module, Synergy, Utils } from "synergy3";
import Discord from "discord.js";

export default class Roll extends Module{
    public Name:        string = "Roll";
    public Description: string = "Using this command you can roll random number.";
    public Category:    string = "Utility";
    public Author:      string = "Thomasss#9258";

    public Access: string[] = [ Access.PLAYER() ]

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);
        this.createSlashCommand(this.Name.toLowerCase(), undefined, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
        .build(builder => builder
            .setDescription(this.Description)
            .addIntegerOption(opt => opt
                .setName("min")
                .setDescription("Minimum number.")
                .setRequired(false)
            )
            .addIntegerOption(opt => opt
                .setName("max")
                .setDescription("Maximum number.")
                .setRequired(false)
            )
        )
        .onExecute(this.Run.bind(this))
        .commit()
    }

    public async Run(interaction: Discord.CommandInteraction){
        let min = interaction.options.getInteger("min") || 1;
        let max = interaction.options.getInteger("max") || 100;

        let emb = new Discord.MessageEmbed()
            .setTitle(`Number ${Utils.getRandomInt(min, max)} is rolled.`)
            .setColor(Colors.Noraml);
            
        await interaction.reply({embeds: [emb] });
    }
}