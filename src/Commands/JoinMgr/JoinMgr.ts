import Discord from "discord.js";
import ICommand from "../ICommand";
import { Guild } from "../../Models/Guild";
import { Utils, Emojis, Colors, CustomMessageSettings } from "../../Utils";
import CommandsController from "../../CommandsController";
import log4js from "log4js";

const logger = log4js.getLogger();

class JoinMgr implements ICommand{
    Name:        string = "JoinMgr";
    Trigger:     string = "!joinmgr";
    Usage:       string = "`!joinmgr <sub_cmd> ...`\n\n" +
                          "**Subcommands:**\n" +
                          "`!joinmgr add-join-role @role` - Add selected role to join roles list. Roles from this list are given to members when they join on server.\n\n" +
                          "`!joinmgr rm-join-role @role` - Remove selected role from join roles list.\n\n" +
                          "`!joinmgr join-roles` - View list of join roles.\n\n" +
                          "`!joinmgr join-message-channel #channel` - Set channel to which join messages will be sent.\n\n" +
                          "`!joinmgr join-message-cfg` - Configure custom join message.\n\n" +
                          "`!joinmgr join-message-enable` - Enable join messages.\n\n" +
                          "`!joinmgr join-message-disable` - Disable join messages.\n\n";

    Description: string = "Using this command admins can set join message, channel, roles and etc.";
    Category:    string = "Utility";
    Author:      string = "Thomasss#9258";
    Controller: CommandsController

    constructor(controller: CommandsController) {
        this.Controller = controller;

        this.Controller.Client.on("RGuildMemberAdd", async (member, rguild, ruser) => {
            if(rguild.JoinRolesIDs.length > 0){
                logger.info(`[CMD] [${this.Name}]`, `[${member.guild}]`, `[${member}]`, "Join Roles present:", `[${rguild.JoinRolesIDs.join(",")}]`);

                var roles:Discord.Role[] = [];
                for(var i in rguild.JoinRolesIDs){
                    var role = await member.guild.roles.fetch(rguild.JoinRolesIDs[i]);
                    if(role){
                        roles.push(role);
                    }else{
                        rguild.JoinRolesIDs.splice(parseInt(i), 1);
                    }
                }
                await Guild.update({ JoinRolesIDs: rguild.JoinRolesIDs }, { where: { ID: rguild.ID } }).catch(err => logger.error(err));

                if(!roles.find(r => !r.editable)){
                    await member.roles.add(roles);
                    logger.info(`[CMD] [${this.Name}]`, `[${member.guild}]`, `[${member}]`, "Added roles:", `[${roles.join(",")}]`);
                }else{
                    logger.info(`[CMD] [${this.Name}]`, `[${member.guild}]`, `[${member}]`, "Not enougth permissions. Sending notification to sys. channel...");
                    var channel: Discord.TextChannel;
                    if(rguild.LogChannelID){
                        channel = this.Controller.Client.channels.cache.find(c => c.id === rguild.LogChannelID) as Discord.TextChannel;
                    }else{
                        channel = member.guild.systemChannel as Discord.TextChannel;
                    }
                    await channel?.send(`${channel.guild.owner?.user}, RainbowBOT don't have permissons to add one of selected roles to joined user. Make RainbowBOT's role upper than join roles.`);
                }
            }

            if(rguild.IsJoinMessageEnabled && rguild.JoinMessageChannelID){
                if(rguild.Meta.jmgr_msg){
                    var msg_settings = rguild.Meta.jmgr_msg;
                    msg_settings.Title = msg_settings.Title?.replace(/%user%/g, member.user.tag);
                    msg_settings.Description = msg_settings.Description?.replace(/%blank%/g, "");
                    msg_settings.Description = msg_settings.Description?.replace(/%user%/g, member.user.toString());
                    var embd = new Discord.MessageEmbed({
                        title: msg_settings.Title,
                        description: msg_settings.Description,
                        image: { url: msg_settings.Image },
                        color: Colors.Success
                    });
                    var avatar_url = member.user.avatarURL();
                    if(msg_settings.Avatar && avatar_url){
                        embd.thumbnail = { url: avatar_url }
                    }
                    
                    var channel = this.Controller.Client.channels.cache.find(c => c.id === rguild.JoinMessageChannelID) as Discord.TextChannel;
                    return await channel.send(embd);
                }else{
                    var embd = new Discord.MessageEmbed({
                        title: `Welcome to ${member.guild}!`,
                        description: `We are happy to see you there, ${member.user}!`,
                        color: Colors.Success
                    });
                    var avatar_url = member.user.avatarURL();
                    if(avatar_url){
                        embd.thumbnail = { url: avatar_url }
                    }
                    
                    var channel = this.Controller.Client.channels.cache.find(c => c.id === rguild.JoinMessageChannelID) as Discord.TextChannel;
                    return await channel.send(embd);
                }
            }
        });
    }
    
    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!joinmgr");
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
                case "add-join-role":{
                    var role_id = Utils.parseID(args[1]);
                    if(role_id && role_id.length === 18){
                        var role = message.guild?.roles.cache.get(role_id);
                        if(guild.JoinRolesIDs.length < 20){
                            guild.JoinRolesIDs.push(role_id);
                            Guild.update({ JoinRolesIDs: guild.JoinRolesIDs }, { where: {ID: guild.ID} }).then(async () => {
                                var all_roles = "";
                                for(var r of guild.JoinRolesIDs){
                                    all_roles += `${Emojis.BlueRoundedArrowRight} <@&${r}>\n`;
                                }

                                var embd = new Discord.MessageEmbed({
                                    title: `New role added to join roles list`,
                                    description: `**Role ${role} added to join roles list.**\n\nAll join roles:\n${all_roles}\n_${guild.JoinRolesIDs.length}/20_`,
                                    color: Colors.Success
                                });
                                return resolve(await message.channel.send(embd));
                            });
                        }else{
                            var all_roles = "";
                            for(var r of guild.JoinRolesIDs){
                                all_roles += `${Emojis.BlueRoundedArrowRight} <@&${r}>\n`;
                            }

                            var embd = new Discord.MessageEmbed({
                                title: `${Emojis.RedErrorCross} You can't add more than 20 roles to join roles list`,
                                description: `**Remove some of them with \`!joinmgr rm-join-role\`**\n\nAll join roles:\n${all_roles}\n_${guild.JoinRolesIDs.length}/20_`,
                                color: Colors.Error
                            });
                            return resolve(await message.channel.send(embd));
                        }
                        
                    }else{
                        var embd = new Discord.MessageEmbed({
                            title: `${Emojis.RedErrorCross} Role ID is invalid. Please, check it, and try again.`,
                            color: Colors.Error
                        });
                        return resolve(await message.channel.send(embd));
                    }
                    break;
                }

                case "rm-join-role":{
                    var role_id = Utils.parseID(args[1]);
                    if(role_id && role_id.length === 18){
                        var role = message.guild?.roles.cache.get(role_id);
                        if(guild.JoinRolesIDs.length > 0){
                            var r_indx = guild.JoinRolesIDs.indexOf(role_id);
                            if(r_indx !== -1){
                                guild.JoinRolesIDs.splice(r_indx, 1);
                                Guild.update({ JoinRolesIDs: guild.JoinRolesIDs }, { where: {ID: guild.ID} }).then(async () => {
                                    var all_roles = "";
                                    for(var r of guild.JoinRolesIDs){
                                        all_roles += `${Emojis.BlueRoundedArrowRight} <@&${r}>\n`;
                                    }
    
                                    var embd = new Discord.MessageEmbed({
                                        title: `Role removed from join roles list`,
                                        description: `**Role ${role} has been removed from join roles list.**\n\nAll join roles:\n${all_roles}\n_${guild.JoinRolesIDs.length}/20_`,
                                        color: Colors.Success
                                    });
                                    return resolve(await message.channel.send(embd));
                                });
                            }else{
                                var all_roles = "";
                                for(var r of guild.JoinRolesIDs){
                                    all_roles += `${Emojis.BlueRoundedArrowRight} <@&${r}>\n`;
                                }

                                var embd = new Discord.MessageEmbed({
                                    title: `${Emojis.RedErrorCross} This role is not in join roles list`,
                                    description: `**Role ${role} is not in join roles list.**\n\nAll join roles:\n${all_roles}\n_${guild.JoinRolesIDs.length}/20_`,
                                    color: Colors.Error
                                });
                                return resolve(await message.channel.send(embd));
                            }
                            
                        }else{
                            var embd = new Discord.MessageEmbed({
                                title: `${Emojis.RedErrorCross} You dont't have roles in join roles list`,
                                description: `**You can add them with \`!joinmgr add-join-role\`**`,
                                color: Colors.Error
                            });
                            return resolve(await message.channel.send(embd));
                        }
                    }else{
                        var embd = new Discord.MessageEmbed({
                            title: `${Emojis.RedErrorCross} Role ID is invalid. Please, check it, and try again.`,
                            color: Colors.Error
                        });
                        return resolve(await message.channel.send(embd));
                    }
                    break;
                }

                case "join-roles":{
                    if(guild.JoinRolesIDs.length > 0){
                        var all_roles = "";
                        for(var r of guild.JoinRolesIDs){
                            all_roles += `${Emojis.BlueRoundedArrowRight} <@&${r}>\n`;
                        }

                        var embd = new Discord.MessageEmbed({
                            title: `Join roles list:`,
                            description: `${all_roles}\n_${guild.JoinRolesIDs.length}/20_`,
                            color: Colors.Noraml
                        });
                        return resolve(await message.channel.send(embd));
                    }else{
                        var embd = new Discord.MessageEmbed({
                            title: `${Emojis.RedErrorCross} You dont't have roles in join roles list`,
                            description: `**You can add them with \`!joinmgr add-join-role\`**`,
                            color: Colors.Error
                        });
                        return resolve(await message.channel.send(embd));
                    }
                    break;
                }

                case "join-message-channel":{
                    var channel_id = Utils.parseID(args[1]);
                    if(channel_id && channel_id.length === 18){
                        var channel = message.guild?.channels.cache.get(channel_id);
                        guild.JoinMessageChannelID = channel_id;
                        Guild.update({ JoinMessageChannelID: guild.JoinMessageChannelID }, { where: { ID: guild.ID } }).then(async () => {
                            var embd = new Discord.MessageEmbed({
                                title: `Configured join message channel`,
                                description: `**Channel ${channel} has been configured to join messages. You can configure custom join message by \`!joinmgr join-message-cfg\` or use default one.**`,
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

                case "join-message-cfg":{
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
                        title: `Custom Join Message Configuration Wizard`,
                        description: `**Welcome to Custom Join Message Configuration Wizard. To configrure custom join message, you need to answer on few questions. Let's Start!**\n\n *Are you ready?*\nType **y/n** (Yes/No)`,
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
                                            guild.Meta.jmgr_msg = msg_settings;
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
                                                title: `Custom Join Message Configuration Wizard`,
                                                description: `**Answer time is over! Configuration Wizard finished.**`,
                                                color: Colors.Warning
                                            });
                                            return resolve(await message.channel.send(embd));
                                        });

                                    }).catch(async () => {
                                        var embd = new Discord.MessageEmbed({
                                            title: `Custom Join Message Configuration Wizard`,
                                            description: `**Answer time is over! Configuration Wizard finished.**`,
                                            color: Colors.Warning
                                        });
                                        return resolve(await message.channel.send(embd));
                                    });

                                }).catch(async () => {
                                    var embd = new Discord.MessageEmbed({
                                        title: `Custom Join Message Configuration Wizard`,
                                        description: `**Answer time is over! Configuration Wizard finished.**`,
                                        color: Colors.Warning
                                    });
                                    return resolve(await message.channel.send(embd));
                                });

                            }).catch(async (err) => {
                                var embd = new Discord.MessageEmbed({
                                    title: `Custom Join Message Configuration Wizard`,
                                    description: `**Answer time is over! Configuration Wizard finished.**`,
                                    color: Colors.Warning
                                });
                                console.error(err);
                                return resolve(await message.channel.send(embd));
                            });

                        }else{
                            var embd = new Discord.MessageEmbed({
                                title: `Custom Join Message Configuration Wizard`,
                                description: `**Configuration Wizard finished.**`,
                                color: Colors.Warning
                            });
                            return resolve(await message.channel.send(embd));
                        }
                    }).catch(async () => {
                        var embd = new Discord.MessageEmbed({
                            title: `Custom Join Message Configuration Wizard`,
                            description: `**Answer time is over! Configuration Wizard finished.**`,
                            color: Colors.Warning
                        });
                        return resolve(await message.channel.send(embd));
                    });
                    break;
                }

                case "join-message-enable":{
                    if(guild.JoinMessageChannelID){
                        var channel = message.guild?.channels.cache.get(guild.JoinMessageChannelID);
                        guild.IsJoinMessageEnabled = true;
                        Guild.update({ IsJoinMessageEnabled: guild.IsJoinMessageEnabled }, { where: { ID: guild.ID } }).then(async () => {
                            var embd = new Discord.MessageEmbed({
                                title: `Join messages enabled!`,
                                description: `**Now join messages will be sending to ${channel}. You can disable join messages by \`!joinmgr join-message-disable\`**`,
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
                            title: `${Emojis.RedErrorCross} Cannot enable join message. First you need to set join message channel by \`!joinmgr join-message-channel #channel\`.`,
                            color: Colors.Error
                        });
                        return resolve(await message.channel.send(embd));
                    }
                    break;
                }

                case "join-message-disable":{
                    guild.IsJoinMessageEnabled = false;
                    Guild.update({ JoinMessageChannelID: guild.JoinMessageChannelID }, { where: { ID: guild.ID } }).then(async () => {
                        var embd = new Discord.MessageEmbed({
                            title: `Join messages disabled!`,
                            description: `**Now join messages disabled. You can enable join messages by \`!joinmgr join-message-enableS\`**`,
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

export = JoinMgr;