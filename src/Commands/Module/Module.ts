import Discord from "discord.js";
import ICommand from "../ICommand";
import { Guild } from "../../Models/Guild";
import { Emojis, Colors, Utils } from "../../Utils";
import CommandsController from "../../CommandsController";
import { User } from "../../Models/User";

import log4js from "log4js";

const logger = log4js.getLogger("command");

class Module implements ICommand{
    Name:        string = "Module";
    Trigger:     string = "!module";
    Usage:       string = "`!module <subcmd> ...`\n\n" +
                          "SubCommands:\n" + 
                          "`unload <mod_name>` - unload module with specified name.\n" +
                          "~~`load <mod_name>` - unload module with specified name.~~\n" +
                          "`reload <mod_name>` - reload module with specified name.\n" +
                          "`list` - list of loaded modules.\n";

    Description: string = "Using this command BOT Admins can manage RainbowBOT modules.";
    Category:    string = "BOT";
    Author:      string = "Thomasss#9258";
    Controller: CommandsController

    constructor(controller: CommandsController) {
        this.Controller = controller; 
    }
    
    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!module");
    }
    
    Run(message: Discord.Message, guild: Guild, user: User){
        return new Promise<Discord.Message>(async (resolve, reject) => {
            if(user.Group === "Admin"){
                let args = message.content.split(" ").slice(1);

                switch(args[0]){
                    case "reload": {
                        if(!args[1]){
                            return resolve(await Utils.ErrMsg("No module name specified.", message.channel));
                        }
                        let module = this.Controller.Commands.find(c => c.Name.toLowerCase() === args[1].toLowerCase());
                        if(!module){
                            return resolve(await Utils.ErrMsg("This module not exists/loaded.", message.channel));
                        }
                        await this.Controller.ReloadCommand(module);
                        return resolve(await message.channel.send(new Discord.MessageEmbed({
                            title: `Successfully reloaded '${module.Name}' module.`,
                            color: Colors.Noraml
                        })));
                    }

                    case "unload": {
                        if(!args[1]){
                            return resolve(await Utils.ErrMsg("No module name specified.", message.channel));
                        }
                        let module = this.Controller.Commands.find(c => c.Name.toLowerCase() === args[1].toLowerCase());
                        if(!module){
                            return resolve(await Utils.ErrMsg("This module not exists/loaded.", message.channel));
                        }
                        await this.Controller.UnLoadCommand(module);
                        return resolve(await message.channel.send(new Discord.MessageEmbed({
                            title: `Successfully unloaded '${module.Name}' module.`,
                            color: Colors.Noraml
                        })));
                    }

                    case "list": {
                        let txt = "";
                        for(let m of this.Controller.Commands){
                            txt += `\`${m.Name}\` (${m.Category}) by ${m.Author}\n`;
                        }
                        return resolve(await message.channel.send(new Discord.MessageEmbed({
                            title: `Loaded modules:`,
                            description: txt,
                            color: Colors.Noraml
                        })));
                    }

                    default: {
                        return resolve(await message.channel.send(new Discord.MessageEmbed({
                            title: `Command Usage:`,
                            description: this.Usage,
                            color: Colors.Noraml
                        })));
                    }
                }
            }else{
                return resolve(await Utils.ErrMsg("You don't have access to this command.", message.channel));
            }
        });
    }
}

export = Module;