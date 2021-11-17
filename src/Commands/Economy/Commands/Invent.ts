import Discord, { MessageEmbed } from "discord.js";
import ICommand from "../../ICommand";
import { Guild } from "../../../Models/Guild";
import { Emojis, Colors, Utils } from "../../../Utils";
import CommandsController from "../../../CommandsController";
import log4js from "log4js";
import { User } from "../../../Models/User";
import { Player } from "../inventory/Player";
import { Item } from "../Items/Item";
import { World } from "../World/World";


const logger = log4js.getLogger("command");

class Invent implements ICommand{
    Name:        string = "Invent";
    Trigger:     string = "!invent";
    Usage:       string = "`!invent` - show your items.\n" +
                          "`!invent restack` - restack items in your inventory";

    Description: string = "Show your items in inventory.";
    Category:    string = "Economy";
    Author:      string = "Thomasss#9258";
    Controller: CommandsController

    constructor(controller: CommandsController) {
        this.Controller = controller;
    }
    
    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!invent");
    }
    
    Run(message: Discord.Message, guild: Guild, user: User){
        return new Promise<Discord.Message>(async (resolve, reject) => {
            let args = message.content.split(" ").slice(1);

            switch(args[0]){
                case "restack":{
                    let player = World.WORLD.getPlayer(user.ID);
                    if(!player){
                        player = await Player.createOrLoadFromStorage(user.ID);
                        World.WORLD.setPlayer(user.ID, player);
                    }

                    player.inventRestack();

                    let emb = new MessageEmbed({
                        title: `Successfully restacked items in your inventory.`,
                        color: Colors.Noraml
                    });
                    return resolve(await message.channel.send(emb));
                }
                default:{
                    let player = World.WORLD.getPlayer(user.ID);
                    if(!player){
                        player = await Player.createOrLoadFromStorage(user.ID);
                        World.WORLD.setPlayer(user.ID, player);
                    }
                    let txt = ""
                    for(let item of player.getInventory()){
                        if(!item.isEmpty()){
                            txt += `**[x${item.getCount()}]** ${item.getItem().getName()} (\`${Item.REGISTRY.getCode(item.getItem())}\`)\n`;
                        }
                    }
                    let emb = new MessageEmbed({
                        title: `${message.author.tag}'s Inventory:`,
                        description: txt,
                        color: Colors.Noraml
                    });
                    return resolve(await message.channel.send(emb));
                }
            }
        });
    }
}

export = Invent;