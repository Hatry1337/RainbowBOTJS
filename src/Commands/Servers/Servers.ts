import Discord from "discord.js";
import ICommand from "../ICommand";
import { Guild } from "../../Models/Guild";
import { Emojis, Colors, Utils } from "../../Utils";
import CommandsController from "../../CommandsController";
import { User } from "../../Models/User";

import log4js from "log4js";

const logger = log4js.getLogger("command");

class Servers implements ICommand{
    Name:        string = "Servers";
    Trigger:     string = "!servers";
    Usage:       string = "`!servers[ <page> <count>]`\n\n" +
                          "`!servers 3 20`\n\n";

    Description: string = "Using this command BOT Admins can view servers list.";
    Category:    string = "BOT";
    Author:      string = "Thomasss#9258";
    Controller: CommandsController

    constructor(controller: CommandsController) {
        this.Controller = controller; 
    }
    
    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!servers");
    }
    
    Run(message: Discord.Message, guild: Guild, user: User){
        return new Promise<Discord.Message>(async (resolve, reject) => {
            if(user.Group === "Admin"){
                var args = message.content.split(" ").slice(1);
                var page = parseInt(args[0]);
                var plen = parseInt(args[1]);

                if(!page || isNaN(page) || !isFinite(page) || page <= 0){
                    page = 1;
                }
                if(!plen || isNaN(plen) || !isFinite(plen) || plen <= 0 || plen > 35){
                    plen = 15;
                }
                if(page * plen > this.Controller.Client.guilds.cache.size + plen){
                    return resolve(await Utils.ErrMsg("This page doesen't exist.", message.channel));
                }
                
                var svlist = "";
                var svs = this.Controller.Client.guilds.cache.array().slice(page * plen - plen, page * plen);
                for(var s of svs){
                    svlist += `**${s.name}**\nID: ${s.id}\nMembers: ${s.memberCount}\n\n`;
                }
                var embd = new Discord.MessageEmbed({
                    title: `Servers List`,
                    description: svlist || "`Empty`",
                    color: Colors.Noraml,
                    footer: {
                        text: `Page ${page}/${Math.floor((this.Controller.Client.guilds.cache.size+plen) / plen)}`
                    }
                });
                return resolve(await message.channel.send(embd));
            }else{
                return resolve(await Utils.ErrMsg("You don't have access to this command.", message.channel));
            }
        });
    }
}

export = Servers;