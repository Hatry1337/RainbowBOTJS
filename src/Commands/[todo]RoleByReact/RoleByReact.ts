import Discord, { Role } from "discord.js";
import ICommand from "../ICommand";
import { Guild } from "../../Models/Guild";
import { Utils, Emojis, Colors, CustomMessageSettings } from "../../Utils";
import CommandsController from "../../CommandsController";

class RoleByReact implements ICommand{
    Name:        string = "RoleByReact";
    Trigger:     string = "!rolebyreact";
    Usage:       string = "`!rolebyreact <message_id> @role <emoji>`\n\n" +
                          "**Examples:**\n" +
                          "`!rolebyreact 827047810905407558 @TestRole :smiley:` - Creates reaction with emoji :smiley: on message with id 827047810905407558. When someone clicks this reaction, they get @TestRole."

    Description: string = "Using this command admins can create .";
    Category:    string = "Info";
    Author:      string = "Thomasss#9258";
    Controller: CommandsController

    constructor(controller: CommandsController) {
        this.Controller = controller;
    }
    
    
    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!rolebyreact");
    }
    
    Run(message: Discord.Message){
        return new Promise<Discord.Message>(async (resolve, reject) => {
            var args = message.content.split(" ").slice(1);
            var page = parseInt(args[0]) || 1;
            var cat = args[1];

            if(!cat){
                var max_page = Math.ceil(this.Controller.Commands.length / 25);
                if(page > 0 && page <= max_page){
                    var embd = new Discord.MessageEmbed({
                        title: `RainbowBOT's Commands \`${page}/${max_page}\``,
                        description: "You can watch detailed usage of command by `!usage <command>`",
                        color: Colors.Noraml
                    });
                    var page_start = ((page-1) * 25);
                    var page_end = page_start + 25;
                    if(this.Controller.Commands.length < page_end){
                        page_end = this.Controller.Commands.length;
                    }
                    for(var i = page_start; i < page_end; i++){
                        var cmd = this.Controller.Commands[i];
                        embd.addField(cmd.Trigger, cmd.Description + `\n\`Category: ${cmd.Category}\``, true);
                    }
        
                    return resolve(await message.channel.send(embd));

                }else{
                    var embd = new Discord.MessageEmbed({
                        title: `${Emojis.RedErrorCross} This page doesen't exist.`,
                        color: Colors.Error
                    });
                    return resolve(await message.channel.send(embd));
                }
                
                
            }else{
                var cmds = this.Controller.Commands.filter(c => c.Category.toLowerCase() === cat.toLowerCase());
                var max_page = Math.ceil(cmds.length / 25);

                if(cmds.length > 0){
                    if(page > 0 && page <= max_page){
                        var embd = new Discord.MessageEmbed({
                            title: `RainbowBOT's \`${cat}\` Commands \`${page}/${Math.ceil(max_page)}\``,
                            description: "You can watch detailed usage of command by `!usage <command>`",
                            color: Colors.Noraml
                        });
                        var page_start = ((page-1) * 25);
                        var page_end = page_start + 25;
                        if(cmds.length < page_end){
                            page_end = cmds.length;
                        }
                        for(var i = page_start; i < page_end; i++){
                            var cmd = cmds[i];
                            embd.addField(cmd.Trigger, cmd.Description + `\n\`Category: ${cmd.Category}\``, true);
                        }
            
                        return resolve(await message.channel.send(embd));
                    }else{
                        var embd = new Discord.MessageEmbed({
                            title: `${Emojis.RedErrorCross} This page doesen't exist.`,
                            color: Colors.Error
                        });
                        return resolve(await message.channel.send(embd));
                    }
                }else{
                    var embd = new Discord.MessageEmbed({
                        title: `${Emojis.RedErrorCross} Commands with this category not found.`,
                        color: Colors.Error
                    });
                    return resolve(await message.channel.send(embd));
                }
                
            }
            
        });
    }
}

export = RoleByReact;