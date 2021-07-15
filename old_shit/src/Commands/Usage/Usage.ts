import Discord from "discord.js";
import ICommand from "../ICommand";
import { Guild } from "../../Models/Guild";
import { Utils, Emojis, Colors, CustomMessageSettings } from "../../Utils";
import CommandsController from "../../CommandsController";

class Usage implements ICommand{
    Name:        string = "Usage";
    Trigger:     string = "!usage";
    Usage:       string = "`!usage <command>`\n\n" +
                          "**Examples:**\n" +
                          "`!usage !help` - Shows usage of \`!help\` command.\n\n";

    Description: string = "Using this command users can view detailed usage information about specified command.";
    Category:    string = "Info";
    Controller: CommandsController

    constructor(controller: CommandsController) {
        this.Controller = controller;
    }
    
    
    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!usage");
    }
    
    Run(message: Discord.Message){
        return new Promise<Discord.Message>(async (resolve, reject) => {
            var args = message.content.split(" ").slice(1);

            if(args[0]){
                var cmd = this.Controller.Commands.find(c => c.Trigger.toLowerCase() === args[0].toLowerCase() || c.Name.toLowerCase() === args[0].toLowerCase());
                if(cmd){
                    var embd = new Discord.MessageEmbed({
                        title: `Usage of \`${cmd?.Trigger}\` command:`,
                        description: cmd?.Usage,
                        color: Colors.Noraml
                    });
    
                    return resolve(await message.channel.send(embd));
                }else{
                    var embd = new Discord.MessageEmbed({
                        title: `${Emojis.RedErrorCross} This command doesen't exist.`,
                        color: Colors.Error
                    });
                    return resolve(await message.channel.send(embd));
                }
                
            }else{
                var embd = new Discord.MessageEmbed({
                    title: `${Emojis.RedErrorCross} No command specified.`,
                    description: `Command Usage: \n${this.Usage}`,
                    color: Colors.Error
                });
                return resolve(await message.channel.send(embd));
            }
        });
    }
}

export = Usage;