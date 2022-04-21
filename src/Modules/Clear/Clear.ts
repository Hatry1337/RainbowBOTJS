import Discord from "discord.js";
import { Access, GuildOnlyError, Module, RainbowBOT, Utils } from "rainbowbot-core";

export default class Clear extends Module{
    public Name:        string = "Clear";
    public Description: string = "Using this command admins and mods can clear messages in text channels.";
    public Category:    string = "Utility";
    public Author:      string = "Thomasss#9258";

    public Access: string[] = [ Access.PERM("MANAGE_MESSAGES") ];

    constructor(bot: RainbowBOT, UUID: string) {
        super(bot, UUID);
        this.SlashCommands.push(
            this.bot.interactions.createSlashCommand(this.Name.toLowerCase(), this.Access, this, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
            .build(builder => builder
                .setDescription(this.Description)
                .addIntegerOption(opt => opt
                    .setName("count")
                    .setDescription("How much messages you want to clear.")
                    .setRequired(true)
                    .setMinValue(1)
                    .setMaxValue(99)
                )
            )
            .onExecute(this.Run.bind(this))
            .commit(),
        );
    }

    public async Run(interaction: Discord.CommandInteraction){
        if(!(interaction.inGuild() || interaction.inCachedGuild())){
            throw new GuildOnlyError();
        }

        let amount = interaction.options.getInteger("count", true);
        let messages = await interaction.channel?.messages.fetch({ limit: amount });
        messages ? await interaction.channel?.bulkDelete(messages) : 0;
        
        return await interaction.reply({ content: `Successfully cleared ${messages?.size} messages!`, ephemeral: true });
    }
}