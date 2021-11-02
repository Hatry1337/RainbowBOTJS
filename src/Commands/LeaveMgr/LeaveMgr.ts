import Discord from "discord.js";
import ICommand from "../ICommand";
import { Guild } from "../../Models/Guild";
import { Utils, Emojis, Colors, CustomMessageSettings } from "../../Utils";
import CommandsController from "../../CommandsController";
import log4js from "log4js";

const logger = log4js.getLogger("command");

class LeaveMgr implements ICommand{
    Name:        string = "LeaveMgr";
    Trigger:     string = "!leavemgr";
    Usage:       string = "`!leavemgr <sub_cmd> ...`\n\n" +
                          "**Subcommands:**\n" +
                          "`!leavemgr leave-message-channel #channel` - Set channel to which leave messages will be sent.\n\n" +
                          "`!leavemgr leave-message-cfg` - Configure custom leave message.\n\n" +
                          "`!leavemgr leave-message-enable` - Enable leave messages.\n\n" +
                          "`!leavemgr leave-message-disable` - Disable leave messages.\n\n";

    Description: string = "Using this command admins can set leave message, channel.";
    Category:    string = "Utility";
    Author:      string = "Thomasss#9258";
    Controller: CommandsController

    constructor(controller: CommandsController) {
        this.Controller = controller;

        this.Controller.Client.on("RGuildMemberRemove", async (member, rguild, ruser) => {
            if(!rguild.Meta.IsLeaveMessageEnabled || !rguild.Meta.LeaveMessageChannelID || !member.user){
                return;
            }

            if(rguild.Meta.lmgr_msg){
                var msg_settings = rguild.Meta.lmgr_msg;
                msg_settings.Title = msg_settings.Title?.replace(/%user%/g, member.user.tag);
                msg_settings.Description = msg_settings.Description?.replace(/%blank%/g, "");
                msg_settings.Description = msg_settings.Description?.replace(/%user%/g, member.user.toString());
                var embd = new Discord.MessageEmbed({
                    title: msg_settings.Title,
                    description: msg_settings.Description,
                    image: { url: msg_settings.Image },
                    color: Colors.Warning
                });
                var avatar_url = member.user.avatarURL();
                if(msg_settings.Avatar && avatar_url){
                    embd.thumbnail = { url: avatar_url }
                }
                
                var channel = this.Controller.Client.channels.cache.find(c => c.id === rguild.Meta.LeaveMessageChannelID) as Discord.TextChannel;
                return await channel.send(embd);
            }else{
                var embd = new Discord.MessageEmbed({
                    title: `${member.user?.tag} leaved from server :(`,
                    color: Colors.Warning
                });
                var avatar_url = member.user.avatarURL();
                if(avatar_url){
                    embd.thumbnail = { url: avatar_url }
                }
                
                var channel = this.Controller.Client.channels.cache.find(c => c.id === rguild.Meta.LeaveMessageChannelID) as Discord.TextChannel;
                return await channel.send(embd);
            }
        });
    }
    
    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!leavemgr");
    }
    
    Run(message: Discord.Message, guild: Guild){
        return new Promise<Discord.Message>(async (resolve, reject) => {

            if(!message.member?.hasPermission("ADMINISTRATOR")){
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
                case "leave-message-channel":{
                    var channel_id = Utils.parseID(args[1]);
                    if(channel_id && channel_id.length === 18){
                        var channel = message.guild?.channels.cache.get(channel_id);
                        guild.Meta.LeaveMessageChannelID = channel_id;
                        Guild.update({ Meta: guild.Meta }, { where: { ID: guild.ID } }).then(async () => {
                            var embd = new Discord.MessageEmbed({
                                title: `Configured leave message channel`,
                                description: `**Channel ${channel} has been configured to leave messages. You can configure custom leave message by \`!leavemgr leave-message-cfg\` or use default one.**`,
                                color: Colors.Success
                            });
                            return resolve(await message.channel.send(embd));
                        }).catch(async err => {
                            console.error(err);
                            var embd = new Discord.MessageEmbed({
                                title: `${Emojis.RedErrorCross} Unexpected error occured. Please contact with bot's support.`,
                                color: Colors.Error
                            });
                            return resolve(await message.channel.send(embd));
                        });
                    }else{
                        var embd = new Discord.MessageEmbed({
                            title: `${Emojis.RedErrorCross} Channel ID is invalid. Please, check it, and try again.`,
                            color: Colors.Error
                        });
                        return resolve(await message.channel.send(embd));
                    }
                    break;
                }

                case "leave-message-cfg":{
                    var msg_filter = (m: Discord.Message) => m.author.id === message.author.id;
                    var wait_settings = {
                        max: 1, 
                        time: 120000, 
                        errors: ['time'] 
                    }
                    var msg_settings: CustomMessageSettings = {
                        Title: "`Empty`"
                    };

                    var emb_main = new Discord.MessageEmbed({
                        title: `Custom Leave Message Configuration Wizard`,
                        description: `**Welcome to Custom Leave Message Configuration Wizard. To configrure custom leave message, you need to answer on few questions. Let's Start!**\n\n *Are you ready?*\nType **y/n** (Yes/No)`,
                        color: Colors.Noraml
                    });
                    await message.channel.send(emb_main);

                    message.channel.awaitMessages(msg_filter, wait_settings).then(async collected => {
                        var msg = collected.first();
                        if(msg?.content.toLowerCase() === "y"){
                            emb_main.description = "*Write title for your rich embed. You can use `%user%` to mention joined user.*";
                            await message.channel.send(emb_main);

                            message.channel.awaitMessages(msg_filter, wait_settings).then(async collected => {
                                var msg = collected.first();
                                if(msg?.content && msg?.content !== ""){
                                    msg_settings.Title = msg.content;
                                }else{
                                    msg_settings.Title = "`Empty`";
                                }

                                emb_main.description =  `**Configured title: \`${msg_settings.Title}\`**\n\n*Write description of your rich embed. You can use \`%user%\` to mention joined user. You can also leave it blank by sending \`%blank%\`*`;
                                await message.channel.send(emb_main);

                                message.channel.awaitMessages(msg_filter, wait_settings).then(async collected => {
                                    var msg = collected.first();
                                    msg_settings.Description = msg?.content;

                                    emb_main.description =  `**Configured description: \`${msg_settings.Description}\`**\n*Do you want attach an image to your message?. Send one if so, or leave blank with \`%blank%\`*`;
                                    await message.channel.send(emb_main);

                                    message.channel.awaitMessages(msg_filter, wait_settings).then(async collected => {
                                        var msg = collected.first();
                                        msg_settings.Image = msg?.attachments.first()?.proxyURL;

                                        emb_main.description =  `**Configured image: \`${msg_settings.Image}\`**\n*Do you want attach an joined user avatar to thumbnail of your message?.\nType **y/n** (Yes/No)*`;
                                        await message.channel.send(emb_main);

                                        message.channel.awaitMessages(msg_filter, wait_settings).then(async collected => {
                                            var msg = collected.first();
                                            msg_settings.Avatar = msg?.content.toLowerCase() === "y";

                                            emb_main.description =  `**Attach avatar: \`${msg_settings.Avatar}\`**\n*All done! Test message will be sent to this channel.*`;
                                            await message.channel.send(emb_main);

                                            msg_settings.Description?.replace(/%blank%/g, "");
                                            guild.Meta.lmgr_msg = msg_settings;
                                            Guild.update({
                                                Meta: guild.Meta
                                            },{
                                                where: {
                                                    ID: guild.ID
                                                }
                                            }).then(async guild => {
                                                msg_settings.Title = msg_settings.Title?.replace(/%user%/g, message.author.tag);
                                                msg_settings.Description = msg_settings.Description?.replace(/%blank%/g, "");
                                                msg_settings.Description = msg_settings.Description?.replace(/%user%/g, message.author.toString());
                                                var embd = new Discord.MessageEmbed({
                                                    title: msg_settings.Title,
                                                    description: msg_settings.Description,
                                                    image: { url: msg_settings.Image },
                                                    color: Colors.Success
                                                });
                                                var avatar_url = message.author.avatarURL();
                                                if(msg_settings.Avatar && avatar_url){
                                                    embd.thumbnail = { url: avatar_url }
                                                }
                                                return resolve(await message.channel.send(embd));
                                            }).catch(async res => {
                                                console.error(res);
                                                var embd = new Discord.MessageEmbed({
                                                    title: `${Emojis.RedErrorCross} Unexpected error occured. Please contact with bot's support.`,
                                                    color: Colors.Error
                                                });
                                                return resolve(await message.channel.send(embd));
                                            });

                                        }).catch(async () => {
                                            var embd = new Discord.MessageEmbed({
                                                title: `Custom Leave Message Configuration Wizard`,
                                                description: `**Answer time is over! Configuration Wizard finished.**`,
                                                color: Colors.Warning
                                            });
                                            return resolve(await message.channel.send(embd));
                                        });

                                    }).catch(async () => {
                                        var embd = new Discord.MessageEmbed({
                                            title: `Custom Leave Message Configuration Wizard`,
                                            description: `**Answer time is over! Configuration Wizard finished.**`,
                                            color: Colors.Warning
                                        });
                                        return resolve(await message.channel.send(embd));
                                    });

                                }).catch(async () => {
                                    var embd = new Discord.MessageEmbed({
                                        title: `Custom Leave Message Configuration Wizard`,
                                        description: `**Answer time is over! Configuration Wizard finished.**`,
                                        color: Colors.Warning
                                    });
                                    return resolve(await message.channel.send(embd));
                                });

                            }).catch(async (err) => {
                                var embd = new Discord.MessageEmbed({
                                    title: `Custom Leave Message Configuration Wizard`,
                                    description: `**Answer time is over! Configuration Wizard finished.**`,
                                    color: Colors.Warning
                                });
                                console.error(err);
                                return resolve(await message.channel.send(embd));
                            });

                        }else{
                            var embd = new Discord.MessageEmbed({
                                title: `Custom Leave Message Configuration Wizard`,
                                description: `**Configuration Wizard finished.**`,
                                color: Colors.Warning
                            });
                            return resolve(await message.channel.send(embd));
                        }
                    }).catch(async () => {
                        var embd = new Discord.MessageEmbed({
                            title: `Custom Leave Message Configuration Wizard`,
                            description: `**Answer time is over! Configuration Wizard finished.**`,
                            color: Colors.Warning
                        });
                        return resolve(await message.channel.send(embd));
                    });
                    break;
                }

                case "leave-message-enable":{
                    if(guild.Meta.LeaveMessageChannelID){
                        var channel = message.guild?.channels.cache.get(guild.Meta.LeaveMessageChannelID);
                        guild.Meta.IsLeaveMessageEnabled = true;
                        Guild.update({ Meta: guild.Meta }, { where: { ID: guild.ID } }).then(async () => {
                            var embd = new Discord.MessageEmbed({
                                title: `Leave messages enabled!`,
                                description: `**Now leave messages will be sending to ${channel}. You can disable leave messages by \`!leavemgr leave-message-disable\`**`,
                                color: Colors.Success
                            });
                            return resolve(await message.channel.send(embd));
                        }).catch(async err => {
                            console.error(err);
                            var embd = new Discord.MessageEmbed({
                                title: `${Emojis.RedErrorCross} Unexpected error occured. Please contact with bot's support.`,
                                color: Colors.Error
                            });
                            return resolve(await message.channel.send(embd));
                        });  
                    }else{
                        var embd = new Discord.MessageEmbed({
                            title: `${Emojis.RedErrorCross} Cannot enable leave message. First you need to set join message channel by \`!leavemgr leave-message-channel #channel\`.`,
                            color: Colors.Error
                        });
                        return resolve(await message.channel.send(embd));
                    }
                    break;
                }

                case "leave-message-disable":{
                    guild.Meta.IsLeaveMessageEnabled = false;
                    Guild.update({ Meta: guild.Meta }, { where: { ID: guild.ID } }).then(async () => {
                        var embd = new Discord.MessageEmbed({
                            title: `Leave messages disabled!`,
                            description: `**Now leave messages disabled. You can enable leave messages by \`!leavemgr leave-message-enable\`**`,
                            color: Colors.Success
                        });
                        return resolve(await message.channel.send(embd));
                    }).catch(async err => {
                        console.error(err);
                        var embd = new Discord.MessageEmbed({
                            title: `${Emojis.RedErrorCross} Unexpected error occured. Please contact with bot's support.`,
                            color: Colors.Error
                        });
                        return resolve(await message.channel.send(embd));
                    });
                    break;
                }

                default: {
                    var embd = new Discord.MessageEmbed({
                        title: `${Emojis.RedErrorCross} Subcommand not found.`,
                        description: `Command Usage: \n${this.Usage}`,
                        color: Colors.Error
                    });
                    return resolve(await message.channel.send(embd));
                }
            }

        });
    }
}

export = LeaveMgr;