import Discord from "discord.js";
import ICommand from "../ICommand";
import { Guild } from "../../Models/Guild";
import { Emojis, Colors, Utils } from "../../Utils";
import CommandsController from "../../CommandsController";
import log4js from "log4js";

const logger = log4js.getLogger();

class Avatar implements ICommand{
    Name:        string = "Avatar";
    Trigger:     string = "!avatar";
    Usage:       string = "`!avatar [user]`\n\n" +
                          "**Example:**\n" +
                          "`!avatar` - show your avatar\n\n" +
                          "`!avatar @User` - show User's avatar\n\n";

    Description: string = "Using this command you can view your, or someone's avatar as full size image.";
    Category:    string = "Utility";
    Author:      string = "Thomasss#9258";
    Controller: CommandsController

    constructor(controller: CommandsController) {
        this.Controller = controller;
    }
    
    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!avatar");
    }
    
    Run(message: Discord.Message){
        return new Promise<Discord.Message>(async (resolve, reject) => {
            var args = message.content.split(" ").slice(1);
            if(args.length === 0){
                var avatar = message.author.avatarURL({ size: 2048 });
                if(avatar){
                    var embd = new Discord.MessageEmbed({
                        title: `${message.author.username}'s avatar`,
                        image: { url: avatar },
                        color: Colors.Noraml
                    });
                    return resolve(await message.channel.send(embd));
                }else{
                    var embd = new Discord.MessageEmbed({
                        title: `${Emojis.RedErrorCross} Cannot your user's avatar!`,
                        color: Colors.Error
                    });
                    return resolve(await message.channel.send(embd));
                }                    
            }

            var user_id = Utils.parseID(args[0]);
            if(user_id && user_id.length === 18){
                var user = message.guild?.members.cache.get(user_id);
                if(!user){
                    var embd = new Discord.MessageEmbed({
                        title: `${Emojis.RedErrorCross} Cannot find this user. Check your user's id, it may be incorrect.`,
                        color: Colors.Error
                    });
                    return resolve(await message.channel.send(embd));
                }

                var avatar = user.user.avatarURL({ size: 2048 });

                if(!avatar){
                    var embd = new Discord.MessageEmbed({
                        title: `${Emojis.RedErrorCross} Cannot get user's avatar!`,
                        color: Colors.Error
                    });
                    return resolve(await message.channel.send(embd));
                }

                var embd = new Discord.MessageEmbed({
                    title: `${user.user.username}'s avatar`,
                    image: { url: avatar },
                    color: Colors.Noraml
                });
                return resolve(await message.channel.send(embd));
            }else{
                var embd = new Discord.MessageEmbed({
                    title: `${Emojis.RedErrorCross} User ID is invalid. Please, check it, and try again.`,
                    color: Colors.Error
                });
                return resolve(await message.channel.send(embd));
            }
        });
    }
}

export = Avatar;