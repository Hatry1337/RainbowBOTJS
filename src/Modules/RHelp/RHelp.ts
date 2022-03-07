import { SlashCommandBuilder } from "@discordjs/builders";
import Discord from "discord.js";
import ModuleManager from "../../ModuleManager";
import { Emojis, Colors } from "../../Utils";
import Module from "../Module";

export default class RHelp extends Module{
    public Name:        string = "RHelp";
    public Usage:       string = "`!rhelp [<page> <category>] `\n\n" +
                          "**Examples:**\n" +
                          "`!rhelp` - Shows first page of help menu.\n\n" +
                          "`!rhelp 2` - Shows second page of help menu.\n\n" +
                          "`!rhelp 1 Info` - Shows first page of \`Info\` category commands.\n\n";

    public Description: string = "Using this command users can explore bot's commands, and find out how to use them.";
    public Category:    string = "Info";
    public Author:      string = "Thomasss#9258";
    
    constructor(Controller: ModuleManager, UUID: string) {
        super(Controller, UUID);
        this.SlashCommands.push(
            new SlashCommandBuilder()
                .setName(this.Name.toLowerCase())
                .setDescription(this.Description)
                .addIntegerOption(opt => opt
                    .setName("page")
                    .setDescription("RHelp command page.")
                    .setRequired(false)
                )
                .addStringOption(opt => opt
                    .setName("category")
                    .setDescription("RHelp commands category.")
                    .setRequired(false)
                ) as SlashCommandBuilder
        );
    }

    public async Init(){
        this.Controller.bot.PushSlashCommands(this.SlashCommands, process.env.NODE_ENV === "development" ? process.env.MASTER_GUILD : "global");
    }

    public Test(interaction: Discord.CommandInteraction){
        return interaction.commandName.toLowerCase() === this.Name.toLowerCase();
    }
    
    public Run(interaction: Discord.CommandInteraction){
        return new Promise<Discord.Message | void>(async (resolve, reject) => {
            let page = interaction.options.getInteger("page") || 1;
            let cat = interaction.options.getString("category");


            let modulesInfo = this.Controller.GetModuleCommonInfo();

            if(cat){
                modulesInfo = modulesInfo.filter(md => md.category === cat);
            }

            var max_page = Math.ceil(modulesInfo.length / 25);
            if(page > 0 && page <= max_page){
                var embd = new Discord.MessageEmbed({
                    title: `RainbowBOT's Modules \`${page}/${max_page}\``,
                    description: "You can watch detailed usage of module by `!usage <module>`",
                    color: Colors.Noraml
                });
                var page_start = ((page-1) * 25);
                var page_end = page_start + 25;


                if(modulesInfo.length < page_end){
                    page_end = modulesInfo.length;
                }
                for(var i = page_start; i < page_end; i++){
                    let md = modulesInfo[i];
                    embd.addField(  `${md.name}`, md.description + `\n\n` + 
                                    `Commands: \`/${md.commands.join("`, /")}\`\n` + 
                                    `Category: \`${md.category}\`\n` +
                                    `Author: \`${md.author}\``, true);
                }
    
                return resolve(await interaction.reply({ embeds: [embd] }).catch(reject));

            }else{
                var embd = new Discord.MessageEmbed({
                    title: `${Emojis.RedErrorCross} This page doesen't exist.`,
                    color: Colors.Error
                });
                return resolve(await interaction.reply({ embeds: [embd] }).catch(reject));
            }
        });
    }
}