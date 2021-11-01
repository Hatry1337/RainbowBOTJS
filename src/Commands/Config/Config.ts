import Discord from "discord.js";
import ICommand from "../ICommand";
import { Guild } from "../../Models/Guild";
import { Utils, Emojis, Colors } from "../../Utils";
import CommandsController from "../../CommandsController";
import log4js from "log4js";

const logger = log4js.getLogger();

class Config implements ICommand{
    Name:        string = "Config";
    Trigger:     string = "!config";
    Usage:       string = "`!config <sub_cmd> ...`\n\n" +
                          "**Subcommands:**\n" +
                          "`!config muted-role[ @role]` - Set role that will be applied to muted users, or if no role specified, create new muted role automatically.\n\n" +
                          "`!config mod-role @role` - Set Moderators role. Users with this role can use Moderation commands like `!mute`, `!unmute`, etc.\n\n";

                          
    Description: string = "Using this command admins can configure bot parameters.";
    Category:    string = "Utility";
    Author:      string = "Thomasss#9258";
    Controller: CommandsController

    constructor(controller: CommandsController) {
        this.Controller = controller;
    }
    
    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!config");
    }
    
    Run(message: Discord.Message, guild: Guild){
        return new Promise<Discord.Message>(async (resolve, reject) => {
            if(!(message.member?.hasPermission("ADMINISTRATOR"))){
                var embd = new Discord.MessageEmbed({
                    title: `${Emojis.RedErrorCross} Only administrators can use this command.`,
                    color: Colors.Error
                });
                return resolve(await message.channel.send(embd));
            }


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
                case "muted-role":{
                    var role_id = Utils.parseID(args[1]);

                    if(role_id && role_id.length === 18){
                        var role = message.guild?.roles.cache.get(role_id);
                        if(!role){
                            var embd = new Discord.MessageEmbed({
                                title: `${Emojis.RedErrorCross} Cannot find this role. Check your role's id, it may be incorrect.`,
                                color: Colors.Error
                            });
                            return resolve(await message.channel.send(embd));
                        }

                        await Guild.update({
                            MutedRoleID: role.id
                        },{
                            where: {
                                ID: message.guild?.id
                            }
                        });

                        var embd = new Discord.MessageEmbed({
                            title: `Configured new Muted role.`,
                            description: `**${role} role now will be applied to Muted users.**`,
                            color: Colors.Success
                        });
                        return resolve(await message.channel.send(embd));
                    }else{
                        var role = await message.guild?.roles.create({
                            data: {
                                name: "muted",
                                color: Colors.Error
                            },
                            reason: `Requested by ${message.author.tag}(${message.author.id})`
                        });
                        if(role){
                            message.guild?.channels.cache.each(async (channel) => {
                                if(role){
                                    var perms: Array<Discord.OverwriteResolvable> = [];

                                    channel.permissionOverwrites.each(async p => {
                                        perms.push({
                                            id: p.id,
                                            allow: p.allow,
                                            deny: p.deny
                                        });
                                    });

                                    perms.push({
                                        id: role.id,
                                        deny: ['ADD_REACTIONS', 'PRIORITY_SPEAKER', 'STREAM', 'SEND_MESSAGES', 
                                        'SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES',
                                        'MENTION_EVERYONE', 'USE_EXTERNAL_EMOJIS', 'SPEAK', 'USE_VAD'],
                                    });

                                    await channel.overwritePermissions(perms, `Muted role setting... Requested by ${message.author.tag}(${message.author.id})`);
                                }
                            });
                            guild.MutedRoleID = role.id;
                            await Guild.update({
                                MutedRoleID: role.id
                            },{
                                where: {
                                    ID: message.guild?.id
                                }
                            });

                            var embd = new Discord.MessageEmbed({
                                title: `Configured new Muted role.`,
                                description: `**${role} role now will be applied to Muted users. All channels premissions overwrited.**`,
                                color: Colors.Success
                            });
                            return resolve(await message.channel.send(embd));
                        }else{
                            var embd = new Discord.MessageEmbed({
                                title: `${Emojis.RedErrorCross} Something went wrong. Cannot create Muted role.`,
                                color: Colors.Error
                            });
                            return resolve(await message.channel.send(embd));
                        }
                    }

                    break;
                }

                case "mod-role":{
                    var role_id = Utils.parseID(args[1]);

                    if(role_id && role_id.length === 18){
                        var role = message.guild?.roles.cache.get(role_id);
                        if(!role){
                            var embd = new Discord.MessageEmbed({
                                title: `${Emojis.RedErrorCross} Cannot find this role. Check your role's id, it may be incorrect.`,
                                color: Colors.Error
                            });
                            return resolve(await message.channel.send(embd));
                        }

                        await Guild.update({
                            ModeratorRoleID: role.id
                        },{
                            where: {
                                ID: message.guild?.id
                            }
                        });

                        var embd = new Discord.MessageEmbed({
                            title: `Configured new Moderator role.`,
                            description: `**Users with ${role} role now can use Moderation commands.**`,
                            color: Colors.Success
                        });
                        return resolve(await message.channel.send(embd));
                    }else{
                        var embd = new Discord.MessageEmbed({
                            title: `${Emojis.RedErrorCross} Role ID is invalid. Please, check it, and try again.`,
                            color: Colors.Error
                        });
                        return resolve(await message.channel.send(embd));
                    }

                    break;
                }

                default: {
                    var embd = new Discord.MessageEmbed({
                        title: `${Emojis.RedErrorCross} Subcommand not found.`,
                        description: `Command Usage: \n${this.Usage}`,
                        color: Colors.Error
                    });
                    return resolve(await message.channel.send(embd));

                    break;
                }
            }
        });
    }
}

export = Config;