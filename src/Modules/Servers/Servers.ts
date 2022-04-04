import Discord from "discord.js";
import { Access, Colors, Module, RainbowBOT, RainbowBOTUserError, User } from "rainbowbot-core";


export default class Servers extends Module{
    public Name:        string = "Servers";
    public Description: string = "Using this command BOT Admins can view servers list.";
    public Category:    string = "BOT";
    public Author:      string = "Thomasss#9258";

    public Access: string[] = [ Access.ADMIN() ];

    constructor(bot: RainbowBOT, UUID: string) {
        super(bot, UUID);
        this.SlashCommands.push(
            this.bot.interactions.createCommand(this.Name.toLowerCase(), this.Access, this, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
                .setDescription(this.Description)
                .addNumberOption(opt => opt
                    .setName("page")
                    .setDescription("Servers list page.")
                    .setMinValue(1)
                ) 
                .addNumberOption(opt => opt
                    .setName("page_size")
                    .setDescription("Servers list page size.")
                    .setMinValue(1)
                    .setMaxValue(35)
                )
                .onExecute(this.Run.bind(this))
                .commit()
        );
    }

    public async Run(interaction: Discord.CommandInteraction, user: User){
        let page = interaction.options.getNumber("page", false) || 1;
        let plen = interaction.options.getNumber("page_size", false) || 15;

        if(page * plen > interaction.client.guilds.cache.size + plen){
            throw new RainbowBOTUserError("This page doesen't exist.");
        }
        
        var svlist = "";
        var svs = Array.from(interaction.client.guilds.cache.values()).slice(page * plen - plen, page * plen);
        for(var s of svs){
            svlist += `**${s.name}**\nID: ${s.id}\nMembers: ${s.memberCount}\n\n`;
        }
        let embd = new Discord.MessageEmbed({
            title: `Servers List`,
            description: svlist || "`Empty`",
            color: Colors.Noraml,
            footer: {
                text: `Page ${page}/${Math.floor((interaction.client.guilds.cache.size+plen) / plen)}`
            }
        });
        return await interaction.reply({ embeds: [ embd ] });
    }
}