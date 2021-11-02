import Discord from "discord.js";
import ICommand from "../ICommand";
import { Guild } from "../../Models/Guild";
import { Emojis, Colors, Utils } from "../../Utils";
import CommandsController from "../../CommandsController";
import log4js from "log4js";
import { AnekAPI } from "./AnekAPI";

const logger = log4js.getLogger("command");

class Anek implements ICommand{
    Name:        string = "Anek";
    Trigger:     string = "!anek";
    Usage:       string = "`!anek [tag | 'id' | 'tags'] [id]`\n\n" +
                          "**Example:**\n" +
                          "`!anek` - get random anek\n\n" +
                          "`!anek штирлиц` - get random anek with 'штирлиц' tag\n\n" +
                          "`!anek id 1143` - get anek with id 1143\n\n" + 
                          "`!anek tags` - get list of existing tags\n\n";

    Description: string = "Using this command you can enjoy some aneks of B category.";
    Category:    string = "Fun";
    Author:      string = "Thomasss#9258";
    Controller: CommandsController

    constructor(controller: CommandsController) {
        this.Controller = controller;
    }
    
    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!anek");
    }
    
    Run(message: Discord.Message){
        return new Promise<Discord.Message>(async (resolve, reject) => {
            var args = message.content.split(" ").slice(1);
            if(args.length === 0){
                AnekAPI.GetRandomAnek().then(async anek => {
                    var embd = new Discord.MessageEmbed({
                        title: `Anek of B category number ${anek.id}`,
                        description: `${anek.anek}\n\nSource: ${anek.source}${anek.tags.length > 0 ? `, Tags: \`${anek.tags.join("`, `")}\`` : ""}`,
                        color: Colors.Noraml
                    });
                    return resolve(await message.channel.send(embd));
                }).catch(async err => {
                    logger.error(`[${this.Name}]`, "Anek.RandomAnek.RequestFailedError:", err);
                    var embd = new Discord.MessageEmbed({
                        title: `${Emojis.RedErrorCross} Cannot get this anek. Is it exist? If you're sure, contact with support.`,
                        color: Colors.Error
                    });
                    return resolve(await message.channel.send(embd));
                });  
            }else{
                if(args[0] === "tags"){
                    AnekAPI.GetTags().then(async tags => {
                        var embd = new Discord.MessageEmbed({
                            title: `Aneks of B category tags`,
                            description: `Existing tags: \`${tags.join("`, `")}\``,
                            color: Colors.Noraml
                        });
                        return resolve(await message.channel.send(embd));
                    }).catch(async err => {
                        logger.error(`[${this.Name}]`, "Anek.Tags.RequestFailedError:", err);
                        var embd = new Discord.MessageEmbed({
                            title: `${Emojis.RedErrorCross} Cannot get aneks tags. Please try again later, or contact with support.`,
                            color: Colors.Error
                        });
                        return resolve(await message.channel.send(embd));
                    });  
                }else if(args[0] === "id"){
                    var id = parseInt(args[1]);
                    if(!id || isNaN(id)){
                        var embd = new Discord.MessageEmbed({
                            title: `${Emojis.RedErrorCross} Missing or Incorrect anek id specified.`,
                            color: Colors.Error
                        });
                        return resolve(await message.channel.send(embd));
                    }

                    AnekAPI.GetAnek(id).then(async anek => {
                        var embd = new Discord.MessageEmbed({
                            title: `Anek of B category number ${anek.id}`,
                            description: `${anek.anek}\n\nSource: ${anek.source}${anek.tags.length > 0 ? `, Tags: \`${anek.tags.join("`, `")}\`` : ""}`,
                            color: Colors.Noraml
                        });
                        return resolve(await message.channel.send(embd));
                    }).catch(async err => {
                        logger.error(`[${this.Name}]`, "Anek.AnekID.RequestFailedError:", err);
                        var embd = new Discord.MessageEmbed({
                            title: `${Emojis.RedErrorCross} Cannot get this anek. Is it exist? If you're sure, contact with support.`,
                            color: Colors.Error
                        });
                        return resolve(await message.channel.send(embd));
                    });  
                }else{
                    var tag = args[0];

                    AnekAPI.GetTaggedRandomAnek(tag).then(async anek => {
                        var embd = new Discord.MessageEmbed({
                            title: `Anek of B category number ${anek.id}`,
                            description: `${anek.anek}\n\nSource: ${anek.source}${anek.tags.length > 0 ? `, Tags: \`${anek.tags.join("`, `")}\`` : ""}`,
                            color: Colors.Noraml
                        });
                        return resolve(await message.channel.send(embd));
                    }).catch(async err => {
                        logger.error(`[${this.Name}]`, "Anek.TaggedAnek.RequestFailedError:", err);
                        var embd = new Discord.MessageEmbed({
                            title: `${Emojis.RedErrorCross} Cannot get this anek. Is it exist? If you're sure, contact with support.`,
                            color: Colors.Error
                        });
                        return resolve(await message.channel.send(embd));
                    });  
                }
            }
        });
    }
}

export = Anek;