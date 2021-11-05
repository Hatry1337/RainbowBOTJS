import Discord from "discord.js";
import ICommand from "../../ICommand";
import { Guild } from "../../../Models/Guild";
import { Emojis, Colors, Utils } from "../../../Utils";
import CommandsController from "../../../CommandsController";
import log4js from "log4js";
import { User } from "../../../Models/User";
import { Item } from "../../../Models/Economy/Item";
import { ItemStack } from "../../../Models/Economy/ItemStack";

const logger = log4js.getLogger("command");

class Items implements ICommand{
    Name:        string = "Items";
    Trigger:     string = "!items";
    Usage:       string = "`!items [user]`\n\n" +
                          "**Example:**\n" +
                          "`!items` - show your inventory\n\n" +
                          "`!items @User` - show User's inventory\n\n";

    Description: string = "Using this command you can view your, or someone's inventory.";
    Category:    string = "Economy";
    Author:      string = "Thomasss#9258";
    Controller: CommandsController

    constructor(controller: CommandsController) {
        this.Controller = controller;
    }
    
    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!items");
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
                var inventory = await user.fetchInventory();
    
                var desc = "";
                for(var i of inventory){
                    desc += `**${i.Item.Name}** (${i.Item.Code}) - \`[${i.Count}]\`\n`;
                }
                var embd = new Discord.MessageEmbed({
                    title: `${target.Tag}'s Inventory`,
                    description: desc || "`Empty`",
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

export = Items;