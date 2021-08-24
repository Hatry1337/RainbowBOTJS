import Discord from "discord.js";
import ICommand from "../ICommand";
import { Emojis, Colors } from "../../Utils";
import CommandsController from "../../CommandsController";

class RHelp implements ICommand{
    Name:        string = "Help";
    Trigger:     string = "!rhelp";
    Usage:       string = "`!rhelp [<page> <category>] `\n\n" +
                          "**Examples:**\n" +
                          "`!rhelp` - Shows first page of help menu.\n\n" +
                          "`!rhelp 2` - Shows second page of help menu.\n\n" +
                          "`!rhelp 1 Info` - Shows first page of \`Info\` category commands.\n\n";

    Description: string = "Using this command users can explore bot's commands, and find out how to use them.";
    Category:    string = "Info";
    Controller: CommandsController

    constructor(controller: CommandsController) {
        this.Controller = controller;
    }
    
    
    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!rhelp");
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

export = RHelp;