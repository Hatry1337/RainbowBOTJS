import Discord from "discord.js";
import ICommand from "../ICommand";
import { Guild } from "../../Models/Guild";
import { Emojis, Colors } from "../../Utils";
import CommandsController from "../../CommandsController";
import log4js from "log4js";

const logger = log4js.getLogger("command");

class Clear implements ICommand{
    Name:        string = "Clear";
    Trigger:     string = "!clear";
    Usage:       string = "`!clear <amount>`\n\n" +
                          "**Example:**\n" +
                          "`!clear 99`\n\n";

    Description: string = "Using this command admins and mods can clear messages in text channels.";
    Category:    string = "Moderation";
    Author:      string = "Thomasss#9258";
    Controller: CommandsController

    constructor(controller: CommandsController) {
        this.Controller = controller;
    }
    
    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!clear");
    }
    
    Run(message: Discord.Message){
        return new Promise<Discord.Message>(async (resolve, reject) => {
            if(!message.member?.permissions.has("MANAGE_MESSAGES")){
                var embd = new Discord.MessageEmbed({
                    title: `${Emojis.RedErrorCross} Only users with \`Manage Messages\` permission can use this command.`,
                    color: Colors.Error
                });
                return resolve(await message.channel.send(embd));
            }


            var args = message.content.split(" ").slice(1);
            if(args.length === 0){
                var embd = new Discord.MessageEmbed({
                    title: `${Emojis.RedErrorCross} Not enough parameters.`,
                    description: `Command Usage: \n${this.Usage}`,
                    color: Colors.Error
                });
                return resolve(await message.channel.send(embd));
            }

            var amount = parseInt(args[0]);

            if(isNaN(amount) || amount < 1 || amount > 99){
                var embd = new Discord.MessageEmbed({
                    title: `${Emojis.RedErrorCross} Invalid amount specified. Only integers more than \`0\` and less than \`100\` allowed.`,
                    color: Colors.Error
                });
                return resolve(await message.channel.send(embd));
            }

            var channel = message.channel as Discord.TextChannel;

            await channel.messages.fetch({ limit: amount + 1 }).then(messages => {
                channel.bulkDelete(messages).then(function () {
                    message.channel.send(`Successfully cleared ${messages.size - 1} messages!`).then(async msg => {
                        await msg.delete({timeout:5000});
                    });
                });
                logger.info(`[${this.Name}]`, `User ${message.author.tag}(${message.author.id}) cleared ${messages.size} messages in ${channel.name}(${channel.id}) on ${channel.guild}(${channel.guild.id})`);
            });
            
        });
    }
}

export = Clear;