import Discord from "discord.js";
import { Access, AccessTarget, Colors, Module, Synergy, SynergyUserError, User } from "synergy3";

export default class Admin extends Module{
    public Name:        string = "Admin";
    public Description: string = "Using this command BOT Admin can obtain Admin group.";
    public Category:    string = "BOT";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = process.env.ADMIN_ID ? [ Access.USER(process.env.ADMIN_ID) ] : [];

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);
        this.SlashCommands.push(
            this.bot.interactions.createSlashCommand(this.Name.toLowerCase(), this.Access, this, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
                .build(builder => builder
                    .setDescription(this.Description)
                )
                .onExecute(this.Run.bind(this))
                .commit()
        );
    }

    public async Run(interaction: Discord.ChatInputCommandInteraction, user: User){
        if(user.groups.indexOf(Access.ADMIN()) !== -1) {
            throw new SynergyUserError("You already have admin group!");
        }

        user.groups.push(Access.ADMIN());

        let embd = new Discord.EmbedBuilder({
            title: `Successfully obtained admin group.`,
            color: Colors.Noraml
        });

        await interaction.reply({ embeds: [ embd ] });
    }
}