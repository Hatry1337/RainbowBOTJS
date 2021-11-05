import Discord from "discord.js";
import ICommand from "../../ICommand";
import { Guild } from "../../../Models/Guild";
import { Emojis, Colors, Utils } from "../../../Utils";
import CommandsController from "../../../CommandsController";
import log4js from "log4js";
import { User } from "../../../Models/User";
import { Item } from "../../../Models/Economy/Item";
import { ItemStack } from "../../../Models/Economy/ItemStack";
import { IMachine } from "../Machines/IMachine";
import { Furnace } from "../Machines/Furnace";
import { Crusher } from "../Machines/Crusher";

const logger = log4js.getLogger("command");

class Machine implements ICommand{
    Name:        string = "Machine";
    Trigger:     string = "!machine";
    Usage:       string = "`!machine[ <machine> ...]`\n\n" +
                          "**Example:**\n" +
                          "`!machine` - show list of all your machines.\n\n" +
                          "`!machine furnace` - show furnace interface.\n\n" +
                          "`!machine furnace put iron_ore` - put Iron Ore to furnace.\n\n";

    Description: string = "Using this command you can interract with machines.";
    Category:    string = "Economy";
    Author:      string = "Thomasss#9258";
    Controller: CommandsController

    Machines: IMachine[] = [
        new Furnace(),
        new Crusher()
    ]

    constructor(controller: CommandsController) {
        this.Controller = controller;
    }
    
    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!machine");
    }
    
    Run(message: Discord.Message, guild: Guild, user: User){
        return new Promise<Discord.Message>(async (resolve, reject) => {
            var args = message.content.split(" ").slice(1);

            var inventory = await user.fetchInventory();

            if(args.length === 0) {
                var desc = "";
                for(var m of this.Machines){
                    if(inventory.find(stack => stack.Item.Code === m.Name.toLowerCase())){
                        desc += `\`${m.Name}\` - ${m.Description}\n`;
                    }
                }
                var embd = new Discord.MessageEmbed({
                    title: `Your Machines:`,
                    description: desc || "You don't have any machines.",
                    color: Colors.Noraml
                });
                return resolve(await message.channel.send(embd));
            }

            var machine = this.Machines.find(m => m.Name.toLowerCase() === args[0].toLowerCase());

            if(!machine){
                var embd = new Discord.MessageEmbed({
                    title: `${Emojis.RedErrorCross} Cannot find this Machine.`,
                    color: Colors.Error
                });
                return resolve(await message.channel.send(embd));
            }

            if(!inventory.find(stack => stack.Item.Code === machine!.Name.toLowerCase())){
                var embd = new Discord.MessageEmbed({
                    title: `${Emojis.RedErrorCross} You don't have this machine.`,
                    color: Colors.Error
                });
                return resolve(await message.channel.send(embd));
            }

            machine.Run(message, guild, user).then(resolve).catch(reject);
        });
    }
}

export = Machine;