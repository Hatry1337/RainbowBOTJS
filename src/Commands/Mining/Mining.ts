import Discord from "discord.js";
import ICommand from "../ICommand";
import { Guild } from "../../Models/Guild";
import { Emojis, Colors, Utils } from "../../Utils";
import CommandsController from "../../CommandsController";
import log4js from "log4js";

const logger = log4js.getLogger("command");

class Mining implements ICommand{
    Name:        string = "Mining";
    Trigger:     string = "!mining";
    Usage:       string = "`!mining <sub_cmd> ...`\n\n" +
                          "**Subcommands:**\n" +
                          "`!mining stats`\n\n";

    Description: string = "Using this command you can check your mining stats.";
    Category:    string = "Economy";
    Author:      string = "Thomasss#9258";
    Controller: CommandsController;

    constructor(controller: CommandsController) {
        this.Controller = controller;

        this.Controller.Client.on("RVoiceChannelJoin", async (channel, member) => {
            Guild.findOrCreate({
                where: {
                    ID: member.guild.id
                },
                defaults: {
                    ID: member.guild.id,
                    Name: member.guild.name,
                    OwnerID: member.guild.ownerID,
                    Region: member.guild.region,
                    SystemChannelID: member.guild.systemChannelID,
                    JoinRolesIDs: [],
                }
            }).then(async res => {
                var guild = res[0];
                
                if(channel.id !== guild.Meta.MiningChannelID) return;


            });
        });
    }
    
    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!mining");
    }
    
    Run(message: Discord.Message){
        return new Promise<Discord.Message>(async (resolve, reject) => {
            var args = message.content.split(" ").slice(1);

            if(args.length === 0){
                var embd = new Discord.MessageEmbed({
                    title: `${Emojis.RedErrorCross} No subcommand provided.`,
                    description: `Command Usage: \n${this.Usage}`,
                    color: Colors.Error
                });
                return resolve(await message.channel.send(embd));
            }

            switch(args[0]){
                case "stats":{
                    Guild.findOrCreate({
                        where: {
                            ID: message.guild?.id
                        },
                        defaults: {
                            ID: message.guild?.id,
                            Name: message.guild?.name,
                            OwnerID: message.guild?.ownerID,
                            Region: message.guild?.region,
                            SystemChannelID: message.guild?.systemChannelID,
                            JoinRolesIDs: [],
                        }
                    }).then(async res => {
                        var guild = message.guild;
                        if(!guild){
                            var embd = new Discord.MessageEmbed({
                                title: `${Emojis.RedErrorCross} This command is not allowed in dm.`,
                                color: Colors.Error
                            });
                            return resolve(await message.channel.send(embd));
                        }


                    }).catch(async res => {
                        logger.error(res);
                        var embd = new Discord.MessageEmbed({
                            title: `${Emojis.RedErrorCross} Unexpected error occured. Please contact with bot's support.`,
                            color: Colors.Error
                        });
                        return resolve(await message.channel.send(embd));
                    });
                }
            }
        });
    }

}

export = Mining;