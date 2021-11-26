import Discord from "discord.js";
import ICommand from "../ICommand";
import { Guild } from "../../Models/Guild";
import { Emojis, Colors, Utils } from "../../Utils";
import CommandsController from "../../CommandsController";
import { User } from "../../Models/User";

import log4js from "log4js";

const logger = log4js.getLogger("command");

class Chusr implements ICommand{
    Name:        string = "Chusr";
    Trigger:     string = "!chusr";
    Usage:       string = "`!chusr @user command...`\n\n" +
                          "`!chusr @Thomasss !inv`";

    Description: string = "Using this command BOT Admins can execute commands under someone's user. For debug purposes only.";
    Category:    string = "BOT";
    Author:      string = "Thomasss#9258";
    Controller: CommandsController

    constructor(controller: CommandsController) {
        this.Controller = controller; 
    }
    
    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!chusr");
    }
    
    Run(message: Discord.Message, guild: Guild, user: User){
        return new Promise<Discord.Message>(async (resolve, reject) => {
            if(user.Group === "Admin"){
                let args = message.content.split(" ").slice(1);
                if(args.length < 2){
                    return resolve(await message.channel.send(`Too few arguments. Command usage:\n${this.Usage}`));
                }
                let userid = Utils.parseID(args[0]);
                let usr = await message.client.users.resolve(userid);
                if(!usr){
                    return resolve(await Utils.ErrMsg("This user not found.", message.channel));
                }
                let membr = message.guild!.member(usr.id);
                
                let ncont = message.content.slice(this.Trigger.length + args[0].length + 2);

                let msg = new Discord.Message(message.client, {
                    id: message.id,
                    author: usr,
                    member: membr,
                    content: ncont,
                    attachments: message.attachments
                }, message.channel);

                this.Controller.FindAndRun(msg).then(async resp => {
                    if(!resp){
                        return resolve(await Utils.ErrMsg("Command not found.", msg.channel));
                    }
                    return resolve(resp);
                }).catch(reject);
            }else{
                return resolve(await Utils.ErrMsg("You don't have access to this command.", message.channel));
            }
        });
    }
}

export = Chusr;