import Discord from "discord.js";
import ICommand from "../ICommand";
import { Guild } from "../../Models/Guild";
import { Emojis, Colors, Utils } from "../../Utils";
import CommandsController from "../../CommandsController";
import log4js from "log4js";
import { User } from "../../Models/User";
import { Item } from "../../Models/Economy/Item";
import { ItemStack } from "../../Models/Economy/ItemStack";

const logger = log4js.getLogger();

class Profile implements ICommand{
    Name:        string = "Profile";
    Trigger:     string = "!profile";
    Usage:       string = "`!profile [user]`\n\n" +
                          "**Example:**\n" +
                          "`!profile` - show your profile\n\n" +
                          "`!profile @User` - show User's profile\n\n";

    Description: string = "Using this command you can view your, or someone's profile.";
    Category:    string = "Economy";
    Author:      string = "Thomasss#9258";
    Controller: CommandsController

    constructor(controller: CommandsController) {
        this.Controller = controller;
    }
    
    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!profile");
    }
    
    Run(message: Discord.Message, guild: Guild, user: User){
        return new Promise<Discord.Message>(async (resolve, reject) => {
            var args = message.content.split(" ").slice(1);
            
            var target: User | null;
            if(args.length === 0) {
                target = user;
            }else{
                target = await User.findOne({
                    where: {
                        ID: Utils.parseID(args[0])
                    }, 
                    include: [{ model: ItemStack, include: [Item] }] 
                });
            }

            if(target){
                var embd = new Discord.MessageEmbed({
                    title: `${target.Tag}'s Profile`,
                    thumbnail: { url: target.Avatar },
                    fields: [
                        {
                            name: "Points",
                            value: target.Points
                        },
                        {
                            name: "Group",
                            value: target.Group
                        }
                    ],
                    color: Colors.Noraml
                });
                return resolve(await message.channel.send(embd));
            }else{
                var embd = new Discord.MessageEmbed({
                    title: `${Emojis.RedErrorCross} Cannot find this user. Check your user's id, it may be incorrect.`,
                    color: Colors.Error
                });
                return resolve(await message.channel.send(embd));
            }
        });
    }
}

export = Profile;