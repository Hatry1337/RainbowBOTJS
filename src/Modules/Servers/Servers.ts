import Discord from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Colors, Module, ModuleManager, User, Utils } from "rainbowbot-core";


export default class Servers extends Module{
    public Name:        string = "Servers";
    public Usage:       string = "`!servers[ <page> <count>]`\n\n" +
                          "`!servers 3 20`\n\n";

    public Description: string = "Using this command BOT Admins can view servers list.";
    public Category:    string = "BOT";
    public Author:      string = "Thomasss#9258";

    constructor(Controller: ModuleManager, UUID: string) {
        super(Controller, UUID);
        this.SlashCommands.push(
            new SlashCommandBuilder()
                .setName(this.Name.toLowerCase())
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
                ) as SlashCommandBuilder
        );
    }
    
    public Test(interaction: Discord.CommandInteraction){
        return interaction.commandName.toLowerCase() === this.Name.toLowerCase();
    }

    public Run(interaction: Discord.CommandInteraction, user: User){
        return new Promise<Discord.Message | void>(async (resolve, reject) => {
            if(user.group === "Admin"){
                let page = interaction.options.getNumber("page", false) || 1;
                let plen = interaction.options.getNumber("page_size", false) || 15;

                if(page * plen > interaction.client.guilds.cache.size + plen){
                    return resolve(await interaction.reply({ embeds: [ await Utils.ErrMsg("This page doesen't exist.") ] }).catch(reject));
                }
                
                var svlist = "";
                var svs = Array.from(interaction.client.guilds.cache.values()).slice(page * plen - plen, page * plen);
                for(var s of svs){
                    svlist += `**${s.name}**\nID: ${s.id}\nMembers: ${s.memberCount}\n\n`;
                }
                var embd = new Discord.MessageEmbed({
                    title: `Servers List`,
                    description: svlist || "`Empty`",
                    color: Colors.Noraml,
                    footer: {
                        text: `Page ${page}/${Math.floor((interaction.client.guilds.cache.size+plen) / plen)}`
                    }
                });
                return resolve(await interaction.reply({ embeds: [ embd ] }).catch(reject));
            }else{
                return resolve(await interaction.reply({ embeds: [ await Utils.ErrMsg("You don't have access to this command.") ] }).catch(reject));
            }
        });
    }
}