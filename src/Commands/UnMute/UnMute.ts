import Discord from "discord.js";
import ICommand from "../ICommand";
import { Guild } from "../../Models/Guild";
import { Utils, Emojis, Colors } from "../../Utils";
import CommandsController from "../../CommandsController";
import { MutedUser } from "../../Models/MutedUser";
import log4js from "log4js";

const logger = log4js.getLogger();

class UnMute implements ICommand{
    Name:        string = "UnMute";
    Trigger:     string = "!unmute";
    Usage:       string = "`!unmute @user`\n\n" +
                          "**Example:**\n" +
                          "`!unmute @GoodBoy\n\n";

    Description: string = "Using this command admins and mods can unmute users.";
    Category:    string = "Moderation";
    Controller: CommandsController

    constructor(controller: CommandsController) {
        this.Controller = controller;
    }
    
    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!unmute");
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
                if(args.length < 1){
                    var embd = new Discord.MessageEmbed({
                        title: `${Emojis.RedErrorCross} Not enough parameters.`,
                        description: `Command Usage: \n${this.Usage}`,
                        color: Colors.Error
                    });
                    return resolve(await message.channel.send(embd));
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

                    MutedUser.findOne({
                        where: {
                            DsID: user.id,
                            GuildID: message.guild?.id
                        }
                    }).then(async muser => {
                        if(!muser || !muser.IsMuted){
                            var embd = new Discord.MessageEmbed({
                                title: `${Emojis.RedErrorCross} This user is not muted.`,
                                color: Colors.Error
                            });
                            return resolve(await message.channel.send(embd));
                        }

                        if(!user){
                            var embd = new Discord.MessageEmbed({
                                title: `${Emojis.RedErrorCross} Cannot find this user. Check your user's id, it may be incorrect.`,
                                color: Colors.Error
                            });
                            return resolve(await message.channel.send(embd));
                        }

                        await user.roles.remove(muser.MuteRoleID);
                        muser.IsMuted = false;
                        muser.IsPermMuted = false;
                        await muser.save();

                        logger.info(`User ${message.author.tag}(${message.author.id}) unmuted ${user.user.tag}(${user.id})`);
                        var embd = new Discord.MessageEmbed({
                            description: `**User ${message.author} unmuted ${user}.**`,
                            color: Colors.Success
                        });
                        await message.delete();
                        return resolve(await message.channel.send(embd));

                    }).catch(async res => {
                        logger.error(res);
                        var embd = new Discord.MessageEmbed({
                            title: `${Emojis.RedErrorCross} Unexpected error occured. Please contact with bot's support.`,
                            color: Colors.Error
                        });
                        return resolve(await message.channel.send(embd));
                    });
                }else{
                    var embd = new Discord.MessageEmbed({
                        title: `${Emojis.RedErrorCross} User ID is invalid. Please, check it, and try again.`,
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
        });
    }
}

export = UnMute;