import { SlashCommandBuilder } from "@discordjs/builders";
import Discord from "discord.js";
import { Colors, Emojis, Module, ModuleManager } from "rainbowbot-core";
import { AnekAPI } from "./AnekAPI";

export default class Anek extends Module{
    public Name:        string = "Anek";
    public Usage:       string = "`!anek [tag | 'id' | 'tags'] [id]`\n\n" +
                          "**Example:**\n" +
                          "`!anek` - get random anek\n\n" +
                          "`!anek штирлиц` - get random anek with 'штирлиц' tag\n\n" +
                          "`!anek id 1143` - get anek with id 1143\n\n" + 
                          "`!anek tags` - get list of existing tags\n\n";

    public Description: string = "Using this command you can enjoy some aneks of B category.";
    public Category:    string = "Fun";
    public Author:      string = "Thomasss#9258";

    constructor(Controller: ModuleManager, UUID: string) {
        super(Controller, UUID);
        this.SlashCommands.push(
            new SlashCommandBuilder()
                .setName(this.Name.toLowerCase())
                .setDescription(this.Description)
                .addStringOption(opt => opt
                    .setName("tag")
                    .setDescription("BAnek query tag. Use \"List\" to list all tags.")
                    .setRequired(false)
                )
                .addIntegerOption(opt => opt
                    .setName("id")
                    .setDescription("BAnek query id.")
                    .setRequired(false)
                ) as SlashCommandBuilder
        );
    }
    
    public Run(interaction: Discord.CommandInteraction){
        return new Promise<Discord.Message | void>(async (resolve, reject) => {
            let tag = interaction.options.getString("tag");
            let id = interaction.options.getInteger("id");

            if(id){
                AnekAPI.GetAnek(id).then(async anek => {
                    var embd = new Discord.MessageEmbed({
                        title: `Anek of B category number ${anek.id}`,
                        description: `${anek.anek}\n\nSource: ${anek.source}${anek.tags.length > 0 ? `, Tags: \`${anek.tags.join("`, `")}\`` : ""}`,
                        color: Colors.Noraml
                    });
                    return resolve(await interaction.reply({ embeds: [embd] }).catch(reject));
                }).catch(async err => {
                    this.Logger.Error("Anek.AnekID.RequestFailedError:", err);
                    var embd = new Discord.MessageEmbed({
                        title: `${Emojis.RedErrorCross} Cannot get this anek. Is it exist? If you're sure, contact with support.`,
                        color: Colors.Error
                    });
                    return resolve(await interaction.reply({ embeds: [embd] }).catch(reject));
                });
            }else if(tag){
                if(tag === "List"){
                    AnekAPI.GetTags().then(async tags => {
                        var embd = new Discord.MessageEmbed({
                            title: `Aneks of B category tags`,
                            description: `Existing tags: \`${tags.join("`, `")}\``,
                            color: Colors.Noraml
                        });
                        return resolve(await interaction.reply({ embeds: [embd] }).catch(reject));
                    }).catch(async err => {
                        this.Logger.Error(`[${this.Name}]`, "Anek.Tags.RequestFailedError:", err);
                        var embd = new Discord.MessageEmbed({
                            title: `${Emojis.RedErrorCross} Cannot get aneks tags. Please try again later, or contact with support.`,
                            color: Colors.Error
                        });
                        return resolve(await interaction.reply({ embeds: [embd] }).catch(reject));
                    });
                }else{
                    AnekAPI.GetTaggedRandomAnek(tag).then(async anek => {
                        var embd = new Discord.MessageEmbed({
                            title: `Anek of B category number ${anek.id}`,
                            description: `${anek.anek}\n\nSource: ${anek.source}${anek.tags.length > 0 ? `, Tags: \`${anek.tags.join("`, `")}\`` : ""}`,
                            color: Colors.Noraml
                        });
                        return resolve(await interaction.reply({ embeds: [embd] }).catch(reject));
                    }).catch(async err => {
                        this.Logger.Error("Anek.TaggedAnek.RequestFailedError:", err);
                        var embd = new Discord.MessageEmbed({
                            title: `${Emojis.RedErrorCross} Cannot get this anek. Is it exist? If you're sure, contact with support.`,
                            color: Colors.Error
                        });
                        return resolve(await interaction.reply({ embeds: [embd] }).catch(reject));
                    });
                }
            }else{
                AnekAPI.GetRandomAnek().then(async anek => {
                    var embd = new Discord.MessageEmbed({
                        title: `Anek of B category number ${anek.id}`,
                        description: `${anek.anek}\n\nSource: ${anek.source}${anek.tags.length > 0 ? `, Tags: \`${anek.tags.join("`, `")}\`` : ""}`,
                        color: Colors.Noraml
                    });
                    return resolve(await interaction.reply({ embeds: [embd] }).catch(reject));
                }).catch(async err => {
                    this.Logger.Error(`[${this.Name}]`, "Anek.RandomAnek.RequestFailedError:", err);
                    var embd = new Discord.MessageEmbed({
                        title: `${Emojis.RedErrorCross} Cannot get this anek. Is it exist? If you're sure, contact with support.`,
                        color: Colors.Error
                    });
                    return resolve(await interaction.reply({ embeds: [embd] }).catch(reject));
                });  
            }
        });
    }
}