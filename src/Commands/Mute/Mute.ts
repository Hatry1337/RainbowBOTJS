import Discord from "discord.js";
import ICommand from "../ICommand";
import { Guild } from "../../Models/Guild";
import { Utils, Emojis, Colors } from "../../Utils";
import CommandsController from "../../CommandsController";
import { MutedUser } from "../../Models/MutedUser";
import log4js from "log4js";

const logger = log4js.getLogger();

class Mute implements ICommand{
    Name:        string = "Mute";
    Trigger:     string = "!mute";
    Usage:       string = "`!mute @user <time> <reason>`\n\n" +
                          "**Time:**\n" +
                          "`1d`, `1h`, `1m`, `1s`, `perm`\n\n" +
                          "**Reason:**\n" +
                          "`any string`\n\n" +
                          "**Example:**\n" +
                          "`!mute @BadBoy 2h Don't be bad ^^\n\n";

    Description: string = "Using this command admins and mods can mute users.";
    Category:    string = "Moderation";
    Author:      string = "Thomasss#9258";
    Controller: CommandsController

    constructor(controller: CommandsController) {
        this.Controller = controller;

        setInterval(async () => {
            logger.info(`[CMD] [${this.Name}]`, "Muted users checking...");
            MutedUser.findAll({
                where: {
                    IsMuted: true
                }
            }).then(async (musrs) => {
                for(var mu of musrs){
                    if(!mu.IsPermMuted && (mu.UnmuteDate || new Date()) < new Date()){
                        mu.IsMuted = false;
                        await mu.save();
                        var guild = await this.Controller.Client.guilds.fetch(mu.GuildID);
                        var user = guild.member(mu.DsID);
                        await user?.roles.remove(mu.MuteRoleID);
                        logger.info(`[CMD] [${this.Name}]`, user?.user.tag, "umuted.");
                    }
                }
            });
        }, 120 * 1000);
    }
    
    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!mute");
    }
    
    Run(message: Discord.Message){
        return new Promise<Discord.Message>(async (resolve, reject) => {
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
                var guild = res[0];
                if(!(message.member?.hasPermission("ADMINISTRATOR") || message.member?.roles.cache.get(guild.ModeratorRoleID || ""))){
                    var embd = new Discord.MessageEmbed({
                        title: `${Emojis.RedErrorCross} Only administrators or moderators can use this command.`,
                        color: Colors.Error
                    });
                    return resolve(await message.channel.send(embd));
                }


                var args = message.content.split(" ").slice(1);
                if(args.length < 3){
                    var embd = new Discord.MessageEmbed({
                        title: `${Emojis.RedErrorCross} Not enough parameters.`,
                        description: `Command Usage: \n${this.Usage}`,
                        color: Colors.Error
                    });
                    return resolve(await message.channel.send(embd));
                }

                var user_id = Utils.parseID(args[0]);
                var time    = Utils.parseShortTime(args[1]);
                var reason  = message.content.slice(this.Trigger.length + args[0].length + args[1].length + 2);
                var is_perm = args[1].toLowerCase() === "perm"; 

                if(is_perm){
                    time = 1;
                }

                if(user_id && user_id.length === 18){
                    var user = message.guild?.members.cache.get(user_id);
                    if(!user){
                        var embd = new Discord.MessageEmbed({
                            title: `${Emojis.RedErrorCross} Cannot find this user. Check your user's id, it may be incorrect.`,
                            color: Colors.Error
                        });
                        return resolve(await message.channel.send(embd));
                    }

                    if(message.member.roles.highest.position >= user.roles.highest.position || message.member?.hasPermission("ADMINISTRATOR")){
                        if(!time || time === 0){
                            var embd = new Discord.MessageEmbed({
                                title: `${Emojis.RedErrorCross} Mute time not specified.`,
                                color: Colors.Error
                            });
                            return resolve(await message.channel.send(embd));
                        }
                        
                        if(!reason){
                            var embd = new Discord.MessageEmbed({
                                title: `${Emojis.RedErrorCross} Mute reason not specified.`,
                                color: Colors.Error
                            });
                            return resolve(await message.channel.send(embd));
                        }

                        if(!guild.MutedRoleID){
                            var embd = new Discord.MessageEmbed({
                                title: `${Emojis.RedErrorCross} No mute role configured.`,
                                description: "Plese contact with your server's administrator to configure muted role.",
                                color: Colors.Error
                            });
                            return resolve(await message.channel.send(embd));
                        }

                        await user.roles.add(guild.MutedRoleID);

                        MutedUser.findOrCreate({
                            where: {
                                DsID: user.id,
                                GuildID: message.guild?.id
                            },
                            defaults: {
                                DsID: user.id,
                                Tag: user.user.tag,
                                GuildID: message.guild?.id,
                                MuterID: message.author.id,
                                Reason: reason,
                                MuteDate: new Date(),
                                UnmuteDate: new Date(new Date().getTime() + time * 1000),
                                IsMuted: true,
                                IsPermMuted: is_perm,
                                MuteRoleID: guild.MutedRoleID
                            }
                        }).then(async res => {
                            var muser = res[0];
                            if(!muser || !user){
                                var embd = new Discord.MessageEmbed({
                                    title: `${Emojis.RedErrorCross} Something went wrong. Try again`,
                                    color: Colors.Error
                                });
                                return resolve(await message.channel.send(embd));
                            }

                            if(!guild.MutedRoleID){
                                var embd = new Discord.MessageEmbed({
                                    title: `${Emojis.RedErrorCross} No mute role configured.`,
                                    description: "Please contact with your server's administrator to configure muted role.",
                                    color: Colors.Error
                                });
                                return resolve(await message.channel.send(embd));
                            }

                            if(!res[1]){
                                muser.Tag = user.user.tag;
                                muser.MuterID = message.author.id;
                                muser.Reason = reason;
                                muser.MuteDate = new Date();
                                muser.UnmuteDate = new Date(new Date().getTime() + time * 1000);
                                muser.IsMuted = true;
                                muser.IsPermMuted = is_perm;
                                muser.MuteRoleID = guild.MutedRoleID;
                                await muser.save();
                            }

                            logger.info(`[CMD] [${this.Name}]`, `User ${message.author.tag}(${message.author.id}) muted ${user.user.tag}(${user.id}). Unmute at: ${muser.UnmuteDate?.toString()}`);
                            var embd = new Discord.MessageEmbed({
                                description: `**User ${message.author} muted ${user}.\nReason: ${reason}\nUnmute at: ${ is_perm ? "Never" : muser.UnmuteDate?.toLocaleDateString() + " " + muser.UnmuteDate?.toLocaleTimeString()}**`,
                                color: Colors.Success
                            });
                            await message.delete();
                            return resolve(await message.channel.send(embd));

                        }).catch(async res => {
                            logger.error(`[CMD] [${this.Name}]`, res);
                            var embd = new Discord.MessageEmbed({
                                title: `${Emojis.RedErrorCross} Unexpected error occured. Please contact with bot's support.`,
                                color: Colors.Error
                            });
                            return resolve(await message.channel.send(embd));
                        });
                    }else{
                        var embd = new Discord.MessageEmbed({
                            title: `${Emojis.RedErrorCross} You can't mute user, that upper than your highest role.`,
                            description: `Contact with server administrator/member with higher role.`,
                            color: Colors.Error
                        });
                        return resolve(await message.channel.send(embd));
                    }

                }else{
                    var embd = new Discord.MessageEmbed({
                        title: `${Emojis.RedErrorCross} User ID is invalid. Please, check it, and try again.`,
                        color: Colors.Error
                    });
                    return resolve(await message.channel.send(embd));
                }
               
            }).catch(async res => {
                logger.error(`[CMD] [${this.Name}]`, res);
                var embd = new Discord.MessageEmbed({
                    title: `${Emojis.RedErrorCross} Unexpected error occured. Please contact with bot's support.`,
                    color: Colors.Error
                });
                return resolve(await message.channel.send(embd));
            });
        });
    }
}

export = Mute;