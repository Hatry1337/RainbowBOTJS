import Discord, { OverwriteResolvable, PermissionOverwrites } from "discord.js";
import ICommand from "../ICommand";
import { Guild } from "../../Models/Guild";
import { Utils, Emojis, Colors } from "../../Utils";
import CommandsController from "../../CommandsController";
import log4js from "log4js";
import { VoiceLobby } from "../../Models/VoiceLobby";

const logger = log4js.getLogger();

class VL implements ICommand{
    Name:        string = "Vl";
    Trigger:     string = "!vl";
    Usage:       string = "`!vl <sub_cmd> ...`\n\n" +
                          "**Subcommands:**\n" +
                          "`!vl setup` - Setup Voice Lobby on this server.\n\n" +
                          "`!vl destroy` - Destroy existing Voice Lobby on this server.\n\n" +
                          "`!vl invite @user` - Invite user to your Voice Lobby channel.\n\n" +
                          "`!vl kick @user` - Get back user's invite and kick them from voice channel.\n\n" +
                          "`!vl public` - Made your Voice Lobby channel public.\n\n" + 
                          "`!vl private` - Made your Voice Lobby channel public.\n\n";


                          
    Description: string = "Using this command users can control their Voice Lobby channels.";
    Category:    string = "Utility";
    Controller: CommandsController

    constructor(controller: CommandsController) {
        this.Controller = controller;

        this.Controller.Client.on("RVoiceChannelJoin", async (channel, member) => {
            logger.info(`[CMD] [${this.Name}]`, `${member.id} joined voice channel ${channel.id} on ${channel.guild?.id}`);
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
        
                //Voice Lobby handler
                if(guild.VLChannelID && channel.id === guild.VLChannelID){
                    VoiceLobby.findOne({
                        where: {
                            OwnerID: member.id,
                            GuildID: member.guild.id
                        }
                    }).then(async vl => {
                        if(vl){
                            var tx_c = channel.guild.channels.resolve(vl.TextChannelID) as Discord.TextChannel;
                            await tx_c.send(`${member}, you already have Voice Lobby channel!`);
                            await member.voice.setChannel(vl.VoiceChannelID);
                            return;
                        }
        
                        var cat = await channel.guild.channels.create(`${member.user.tag}'s Channel`, {
                            type: "category",
                            permissionOverwrites: [
                                {
                                    id: member.guild.roles.everyone,
                                    deny: [ 'SEND_MESSAGES', 'SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'MENTION_EVERYONE',
                                            'SPEAK', 'USE_VAD', 'CONNECT', 'VIEW_CHANNEL', 'STREAM', 'READ_MESSAGE_HISTORY',
                                            'VIEW_CHANNEL'
                                    ],
                                },
                                {
                                    id: member.id,
                                    allow: ['SEND_MESSAGES', 'SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'SPEAK', 
                                            'USE_VAD', 'CONNECT', 'VIEW_CHANNEL', 'STREAM', 'READ_MESSAGE_HISTORY', 'MUTE_MEMBERS', 'PRIORITY_SPEAKER', 'MANAGE_CHANNELS' ],
                                }
                            ],
                            position: 9999
                        });
        
                        var tx_c = await channel.guild.channels.create("text", {
                            type: "text",
                            parent: cat
                        });
        
                        var vc_c = await channel.guild.channels.create("voice", {
                            type: "voice",
                            parent: cat
                        });
        
                        await member.voice.setChannel(vc_c);
        
                        await VoiceLobby.create({
                            OwnerID: member.id,
                            OwnerTag: member.user.tag,
                            GuildID: channel.guild.id,
                            IsPrivate: true,
                            InvitedUsersIDs: [],
                            CategoryID: cat.id,
                            TextChannelID: tx_c.id,
                            VoiceChannelID: vc_c.id,
                        }); 
                    });
                }
            }).catch(err => logger.error(`[CMD] [${this.Name}]`, "RVoiceChannelJoin Event Exception: ", err));
        });

        this.Controller.Client.on("RVoiceChannelQuit", async (channel, member) => {
            logger.info(`${member.id} leaved from voice channel ${channel.id} on ${channel.guild?.id}`);
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
        
                if(channel.members.size === 0){
        
                    //Voice Lobby handler
                    if(guild.VLChannelID){
                        VoiceLobby.findOne({
                            where: {
                                OwnerID: member.id,
                                GuildID: member.guild.id
                            }
                        }).then(async vl => {
                            if(vl){
                                await channel.guild.channels.resolve(vl.TextChannelID)?.delete();
                                await channel.guild.channels.resolve(vl.VoiceChannelID)?.delete();
                                await channel.guild.channels.resolve(vl.CategoryID)?.delete();
                                await vl.destroy();
                                logger.info(`${member.id} destroyed voice lobby ${channel.id} on ${channel.guild?.id}`);
                            }
                        });
                    }
                }
        
            }).catch(err => logger.error(`[CMD] [${this.Name}]`, "RVoiceChannelQuit Event Exception: ", err));
        });
    }
    
    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!vl");
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
                    case "setup":{
                        if(!(message.member?.hasPermission("ADMINISTRATOR"))){
                            var embd = new Discord.MessageEmbed({
                                title: `${Emojis.RedErrorCross} Only administrators can use this command.`,
                                color: Colors.Error
                            });
                            return resolve(await message.channel.send(embd));
                        }

                        if(guild.VLChannelID){
                            var embd = new Discord.MessageEmbed({
                                title: `${Emojis.RedErrorCross} Voice Lobby already configured on this server.`,
                                color: Colors.Error
                            });
                            return resolve(await message.channel.send(embd));
                        }

                        var cat = await message.guild?.channels.create("Voice Lobbys", {
                            type: "category",
                            permissionOverwrites: [
                                {
                                    id: message.guild.roles.everyone,
                                    deny: ['SEND_MESSAGES', 'SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 
                                    'MENTION_EVERYONE', 'USE_EXTERNAL_EMOJIS', 'SPEAK', 'USE_VAD', 'CONNECT', 'VIEW_CHANNEL'],
                                }
                            ]
                        });

                        var lb_c = await message.guild?.channels.create("Create Lobby", {
                            type: "voice",
                            parent: cat,
                            permissionOverwrites: [
                                {
                                    id: message.guild.roles.everyone,
                                    allow: ['VIEW_CHANNEL', 'CONNECT']
                                }
                            ]
                        });

                        var cmd_c = await message.guild?.channels.create("vl-commands", {
                            type: "text",
                            parent: cat,
                            permissionOverwrites: [
                                {
                                    id: message.guild.roles.everyone,
                                    allow: [ 'VIEW_CHANNEL', 'SEND_MESSAGES' ]
                                }
                            ]
                        });

                        await Guild.update({
                            VLChannelID: lb_c?.id
                        },{
                            where: {
                                ID: message.guild?.id
                            }
                        });

                        var embd = new Discord.MessageEmbed({
                            title: `Successfully configurated Voice Lobby.`,
                            description: `**Voice Lobby creation channel: ${lb_c}.**`,
                            color: Colors.Success
                        });
                        return resolve(await message.channel.send(embd));

                        break;
                    }

                    case "destroy":{
                        if(!(message.member?.hasPermission("ADMINISTRATOR"))){
                            var embd = new Discord.MessageEmbed({
                                title: `${Emojis.RedErrorCross} Only administrators can use this command.`,
                                color: Colors.Error
                            });
                            return resolve(await message.channel.send(embd));
                        }

                        if(!guild.VLChannelID){
                            var embd = new Discord.MessageEmbed({
                                title: `${Emojis.RedErrorCross} Voice Lobby is not configured on this server.`,
                                color: Colors.Error
                            });
                            return resolve(await message.channel.send(embd));
                        }

                        var cat_c = message.guild?.channels.resolve(guild.VLChannelID)?.parent;
                        if(!cat_c){
                            var embd = new Discord.MessageEmbed({
                                title: `${Emojis.RedErrorCross} Voice Lobby is not configured on this server.`,
                                color: Colors.Error
                            });
                            return resolve(await message.channel.send(embd));
                        }

                        for(var c of cat_c.children){
                            await c[1].delete();
                        }
                        await cat_c.delete();
                        
                        VoiceLobby.findAll({
                            where: {
                                GuildID: message.guild?.id
                            }
                        }).then(async vls => {
                            for(var vl of vls){
                                await message.guild?.channels.resolve(vl.CategoryID)?.delete();
                                await message.guild?.channels.resolve(vl.TextChannelID)?.delete();
                                await message.guild?.channels.resolve(vl.VoiceChannelID)?.delete();
                                await vl.destroy();
                            }

                            await Guild.update({
                                VLChannelID: null
                            },{
                                where: {
                                    ID: message.guild?.id
                                }
                            });

                            var embd = new Discord.MessageEmbed({
                                title: `Successfully destroyed Voice Lobby configuration.`,
                                description: `**Voice Lobbys now unavailable on this server.**`,
                                color: Colors.Success
                            });
                            return resolve(await message.channel.send(embd));
                        });

                        break;
                        
                    }

                    case "invite":{
                        var user_id = Utils.parseID(args[1]);

                        if(user_id && user_id.length === 18){
                            var user = message.guild?.members.resolve(user_id);
                            if(!user){
                                var embd = new Discord.MessageEmbed({
                                    title: `${Emojis.RedErrorCross} Cannot find this user. Check your user's id, it may be incorrect.`,
                                    color: Colors.Error
                                });
                                return resolve(await message.channel.send(embd));
                            }

                            VoiceLobby.findOne({
                                where: {
                                    OwnerID: message.author.id,
                                    GuildID: message.guild?.id
                                }
                            }).then(async vl => {
                                if(!user){
                                    var embd = new Discord.MessageEmbed({
                                        title: `${Emojis.RedErrorCross} Cannot find this user. Check your user's id, it may be incorrect.`,
                                        color: Colors.Error
                                    });
                                    return resolve(await message.channel.send(embd));
                                }
                                if(!vl){
                                    var embd = new Discord.MessageEmbed({
                                        title: `${Emojis.RedErrorCross} You don't have active Voice Lobby.`,
                                        color: Colors.Error
                                    });
                                    return resolve(await message.channel.send(embd));
                                }

                                var cat = message.guild?.channels.resolve(vl.CategoryID);
                                var tx_c = message.guild?.channels.resolve(vl.TextChannelID);
                                var vc_c = message.guild?.channels.resolve(vl.VoiceChannelID);

                                var perms: Array<OverwriteResolvable> = [];

                                cat?.permissionOverwrites.each(async p => {
                                    perms.push({
                                        id: p.id,
                                        allow: p.allow,
                                        deny: p.deny
                                    });
                                });

                                perms.push({ 
                                    id: user.id,
                                    allow: ['SEND_MESSAGES', 'SPEAK', 'USE_VAD', 'CONNECT', 'VIEW_CHANNEL', 'STREAM', 'READ_MESSAGE_HISTORY' ]
                                });
                                
                                await cat?.overwritePermissions(perms);
                                await tx_c?.overwritePermissions(perms);
                                await vc_c?.overwritePermissions(perms);

                                var embd = new Discord.MessageEmbed({
                                    title: `Successfully invited user to your Voice Lobby.`,
                                    description: `**${user} now have access to Voice and Text channels in your Voice Lobby.**`,
                                    color: Colors.Success
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

                        break;
                    }

                    case "kick":{
                        var user_id = Utils.parseID(args[1]);

                        if(user_id === message.author.id){
                            var embd = new Discord.MessageEmbed({
                                title: `${Emojis.RedErrorCross} You can't kick yourself.`,
                                color: Colors.Error
                            });
                            return resolve(await message.channel.send(embd));
                        }

                        if(user_id && user_id.length === 18){
                            var user = message.guild?.members.resolve(user_id);
                            if(!user){
                                var embd = new Discord.MessageEmbed({
                                    title: `${Emojis.RedErrorCross} Cannot find this user. Check your user's id, it may be incorrect.`,
                                    color: Colors.Error
                                });
                                return resolve(await message.channel.send(embd));
                            }

                            VoiceLobby.findOne({
                                where: {
                                    OwnerID: message.author.id,
                                    GuildID: message.guild?.id
                                }
                            }).then(async vl => {
                                if(!user){
                                    var embd = new Discord.MessageEmbed({
                                        title: `${Emojis.RedErrorCross} Cannot find this user. Check your user's id, it may be incorrect.`,
                                        color: Colors.Error
                                    });
                                    return resolve(await message.channel.send(embd));
                                }
                                if(!vl){
                                    var embd = new Discord.MessageEmbed({
                                        title: `${Emojis.RedErrorCross} You don't have active Voice Lobby.`,
                                        color: Colors.Error
                                    });
                                    return resolve(await message.channel.send(embd));
                                }

                                var cat = message.guild?.channels.resolve(vl.CategoryID);
                                var tx_c = message.guild?.channels.resolve(vl.TextChannelID);
                                var vc_c = message.guild?.channels.resolve(vl.VoiceChannelID);

                                var perms: Array<OverwriteResolvable> = [];

                                cat?.permissionOverwrites.each(async p => {
                                    if(p.id === user?.id){
                                        return;
                                    }
                                    perms.push({
                                        id: p.id,
                                        allow: p.allow,
                                        deny: p.deny
                                    });
                                });
                                
                                await cat?.overwritePermissions(perms);
                                await tx_c?.overwritePermissions(perms);
                                await vc_c?.overwritePermissions(perms);
                                if(vc_c?.members.has(user.id)){
                                    await user.voice.kick();
                                }

                                var embd = new Discord.MessageEmbed({
                                    title: `Successfully kicked user from your Voice Lobby.`,
                                    description: `**${user} now don't have access to Voice and Text channels in your Voice Lobby.**`,
                                    color: Colors.Success
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

                        break;
                    }

                    case "public":{
                        VoiceLobby.findOne({
                            where: {
                                OwnerID: message.author.id,
                                GuildID: message.guild?.id
                            }
                        }).then(async vl => {
                            if(!vl){
                                var embd = new Discord.MessageEmbed({
                                    title: `${Emojis.RedErrorCross} You don't have active Voice Lobby.`,
                                    color: Colors.Error
                                });
                                return resolve(await message.channel.send(embd));
                            }

                            if(!message.member){
                                var embd = new Discord.MessageEmbed({
                                    title: `${Emojis.RedErrorCross} Something went wrong.`,
                                    color: Colors.Error
                                });
                                return resolve(await message.channel.send(embd));
                            }

                            var cat = message.guild?.channels.resolve(vl.CategoryID);
                            var tx_c = message.guild?.channels.resolve(vl.TextChannelID);
                            var vc_c = message.guild?.channels.resolve(vl.VoiceChannelID);

                            var perms: Array<OverwriteResolvable> = [
                                {
                                    id: message.member.guild.roles.everyone,
                                    deny: [ 'SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'MENTION_EVERYONE', 'USE_VAD' ]
                                },
                                {
                                    id: message.member.id,
                                    allow: ['SEND_MESSAGES', 'SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'SPEAK', 
                                            'USE_VAD', 'CONNECT', 'VIEW_CHANNEL', 'STREAM', 'READ_MESSAGE_HISTORY', 'MUTE_MEMBERS', 'PRIORITY_SPEAKER' ],
                                }
                            ];
                            
                            await cat?.overwritePermissions(perms);
                            await tx_c?.overwritePermissions(perms);
                            await vc_c?.overwritePermissions(perms);

                            var embd = new Discord.MessageEmbed({
                                title: `Voice Lobby type is \`public\` now.`,
                                description: `**Any users now can connect to voice channel and write messages in text channel.**`,
                                color: Colors.Success
                            });
                            return resolve(await message.channel.send(embd));

                        });

                        break;
                    }

                    case "private":{
                        VoiceLobby.findOne({
                            where: {
                                OwnerID: message.author.id,
                                GuildID: message.guild?.id
                            }
                        }).then(async vl => {
                            if(!vl){
                                var embd = new Discord.MessageEmbed({
                                    title: `${Emojis.RedErrorCross} You don't have active Voice Lobby.`,
                                    color: Colors.Error
                                });
                                return resolve(await message.channel.send(embd));
                            }

                            if(!message.member){
                                var embd = new Discord.MessageEmbed({
                                    title: `${Emojis.RedErrorCross} Something went wrong.`,
                                    color: Colors.Error
                                });
                                return resolve(await message.channel.send(embd));
                            }

                            var cat = message.guild?.channels.resolve(vl.CategoryID);
                            var tx_c = message.guild?.channels.resolve(vl.TextChannelID);
                            var vc_c = message.guild?.channels.resolve(vl.VoiceChannelID);

                            var perms: Array<OverwriteResolvable> = [
                                {
                                    id: message.member.guild.roles.everyone,
                                    deny: [ 'SEND_MESSAGES', 'SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'MENTION_EVERYONE',
                                            'SPEAK', 'USE_VAD', 'CONNECT', 'VIEW_CHANNEL', 'STREAM', 'READ_MESSAGE_HISTORY',
                                            'VIEW_CHANNEL'
                                    ],
                                },
                                {
                                    id: message.member.id,
                                    allow: ['SEND_MESSAGES', 'SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'SPEAK', 
                                            'USE_VAD', 'CONNECT', 'VIEW_CHANNEL', 'STREAM', 'READ_MESSAGE_HISTORY', 'MUTE_MEMBERS', 'PRIORITY_SPEAKER' ],
                                }
                            ];
                            
                            await cat?.overwritePermissions(perms);
                            await tx_c?.overwritePermissions(perms);
                            await vc_c?.overwritePermissions(perms);

                            var embd = new Discord.MessageEmbed({
                                title: `Voice Lobby type is \`private\` now.`,
                                description: `**Only you and invited users have access to channels.**`,
                                color: Colors.Success
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

                        break;
                    }
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

export = VL;