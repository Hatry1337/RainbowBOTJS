import Discord, { GuildChannel, TextChannel } from "discord.js";
import CommandsController from "./CommandsController";
import RClient from "./RClient";
import { sequelize } from "./Database";
import { Guild } from "./Models/Guild";
import { Colors } from "./Utils";
import log4js from "log4js";
import { MutedUser } from "./Models/MutedUser";
import { VoiceLobby } from "./Models/VoiceLobby";
import { MusicManager } from "./Models/MusicManager";

log4js.configure({
    appenders: {
        console: { type: 'console' },
        file: { type: 'file', filename: 'botlog.log' },
    },
    categories: {
        default: { appenders: ['console', 'file'], level: 'info' }
    }
});

declare module 'discord.js' {
    interface ClientEvents {
        RVoiceChannelJoin: [VoiceChannel, GuildMember],
        RVoiceChannelQuit: [VoiceChannel, GuildMember],
        RVoiceChannelChange: [VoiceChannel, VoiceChannel, GuildMember],
    }
}

const logger = log4js.getLogger();
const client = new RClient();
const commandsController = new CommandsController(client);

(async () => {
    await sequelize.sync({force: false});
    logger.info(`DB Synced.`);
})();

client.once("ready", async () => {
    logger.info("Bot started.");

    logger.info("[GC] Starting guilds caching...");
    Guild.findAll({
        where:{
            IsBanned: false
        }
    }).then(async guilds => {
        for(var i in guilds){
            await client.guilds.fetch(guilds[i].ID, true, true).catch(err => {
                logger.warn('[GC] Guild Fetch Error:', err);
            });
            logger.info(`[GC] Guild ${parseInt(i)+1}/${guilds.length}`);
        }
    }).catch(err => {
        logger.error('[GC] Guilds Caching error:', err);
    });

    logger.info("[MMC] Starting MusicManagers caching...");
    var managers = await MusicManager.findAll();
    for(var i in managers){
        var ch = await client.channels.fetch(managers[i].get("music_channel_id")).catch(async e => {
            if(e && e.code === 10003){
                logger.info(`[MMC] [${managers[i].get("music_channel_id")}] Channel not found. Deleting manager`)
                await managers[i].destroy();
            }
        }) as Discord.TextChannel;
        if(ch){
            await ch.messages.fetch();
            console.log(`${parseInt(i)+1}/${managers.length}`);
        }
    }


    //Mutes checker
    setInterval(async () => {
        logger.info("Muted users checking...");
        MutedUser.findAll({
            where: {
                IsMuted: true
            }
        }).then(async (musrs) => {
            for(var mu of musrs){
                if(!mu.IsPermMuted && (mu.UnmuteDate || new Date()) < new Date()){
                    mu.IsMuted = false;
                    await mu.save();
                    var guild = await client.guilds.fetch(mu.GuildID);
                    var user = guild.member(mu.DsID);
                    await user?.roles.remove(mu.MuteRoleID);
                    logger.info(user?.user.tag, "umuted.");
                }
            }
        });
    }, 120 * 1000);
});

client.on("voiceStateUpdate", async (vs1, vs2) => {
    if(!vs1.channel && vs2.channel && vs2.member){
        client.emit("RVoiceChannelJoin", vs2.channel, vs2.member);
    }else if(vs1.channel && !vs2.channel && vs2.member){
        client.emit("RVoiceChannelQuit", vs1.channel, vs2.member);
    }else if(vs1.channel && vs2.channel && vs2.member){
        client.emit("RVoiceChannelChange", vs1.channel, vs2.channel, vs2.member);
        if(vs1.channel.id !== vs2.channel.id){
            client.emit("RVoiceChannelQuit", vs1.channel, vs2.member);
            client.emit("RVoiceChannelJoin", vs2.channel, vs2.member);
        }
    }
});

client.on('message', async message => {
    if(message.author.id === client.user?.id) return
    if(message.channel.type === "dm") { 
        await message.channel.send("Команды в личных сообщениях не поддерживаются :cry:"); 
        return; 
    }
    if(message.author.bot) return;
    if(!message.content.startsWith("!")) return;

    await commandsController.FindAndRun(message);
});

client.on("guildMemberAdd", async (member) => {
    logger.info(`[GuildMemberAddEvent] Guild[${member.guild.id}] Member[${member.id}] Event fired.`);
    Guild.findOrCreate({
        where: {
            ID: member.guild?.id
        },
        defaults: {
            ID: member.guild?.id,
            Name: member.guild?.name,
            OwnerID: member.guild?.ownerID,
            Region: member.guild?.region,
            SystemChannelID: member.guild?.systemChannelID,
            JoinRolesIDs: [],
        }
    }).then(async res => {
        var guild = res[0];

        logger.info(`[GuildMemberAddEvent] Guild[${member.guild.id}] Member[${member.id}] Guild data fetched.`);

        if(guild.JoinRolesIDs.length > 0){
            logger.info(`[GuildMemberAddEvent] Guild[${member.guild.id}] Member[${member.id}] [JoinRoles] Join roles present.`);

            var roles:Discord.Role[] = [];
            for(var i in guild.JoinRolesIDs){
                var role = await member.guild.roles.fetch(guild.JoinRolesIDs[i]);
                if(role){
                    logger.info(`[GuildMemberAddEvent] Guild[${member.guild.id}] Member[${member.id}] [JoinRoles] Fetched Role[${role.id}]`);
                    roles.push(role);
                }else{
                    logger.info(`[GuildMemberAddEvent] Guild[${member.guild.id}] Member[${member.id}] [JoinRoles] Cannot fetch role, deleting.`);
                    guild.JoinRolesIDs.splice(parseInt(i), 1);
                }
            }
            await Guild.update({ JoinRolesIDs: guild.JoinRolesIDs }, { where: { ID: guild.ID } }).catch(err => logger.error(err));
            logger.info(`[GuildMemberAddEvent] Guild[${member.guild.id}] Member[${member.id}] [JoinRoles] Updated guild data.`);

            if(!roles.find(r => !r.editable)){
                await member.roles.add(roles);

                var strroles = "[";
                roles.every((v) => strroles += v.id + ",");
                strroles = strroles.slice(0, strroles.length - 1);
                strroles += "]";

                logger.info(`[GuildMemberAddEvent] Guild[${member.guild.id}] Member[${member.id}] [JoinRoles] Added roles ${strroles} to Member${member.id}`);
            }else{
                logger.info(`[GuildMemberAddEvent] Guild[${member.guild.id}] Member[${member.id}] [JoinRoles] Cannot add roles. No permissions.`);
                
                var channel: Discord.TextChannel;
                if(guild.LogChannelID){
                    channel = client.channels.cache.find(c => c.id === guild.LogChannelID) as Discord.TextChannel;
                }else{
                    channel = member.guild.systemChannel as TextChannel;
                }
                await channel?.send(`${channel.guild.owner?.user}, RainbowBOT don't have permissons to add one of selected roles to joined user. Make RainbowBOT's role upper than join roles.`);
            }
        }

        if(guild.IsJoinMessageEnabled && guild.JoinMessageChannelID){
            if(guild.Meta.jmgr_msg){
                var msg_settings = guild.Meta.jmgr_msg;
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
                
                var channel = client.channels.cache.find(c => c.id === guild.JoinMessageChannelID) as Discord.TextChannel;
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
                
                var channel = client.channels.cache.find(c => c.id === guild.JoinMessageChannelID) as Discord.TextChannel;
                return await channel.send(embd);
            }
        }
    }).catch(err => { logger.error("GuildMemberAdd Event Exception: ", err) });
});

client.on("guildMemberRemove", async (member) => {
    Guild.findOrCreate({
        where: {
            ID: member.guild?.id
        },
        defaults: {
            ID: member.guild?.id,
            Name: member.guild?.name,
            OwnerID: member.guild?.ownerID,
            Region: member.guild?.region,
            SystemChannelID: member.guild?.systemChannelID,
            JoinRolesIDs: [],
        }
    }).then(async res => {
        var guild = res[0];

        if(!guild.Meta.IsLeaveMessageEnabled || !guild.Meta.LeaveMessageChannelID || !member.user){
            return;
        }

        if(guild.Meta.lmgr_msg){
            var msg_settings = guild.Meta.lmgr_msg;
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
            
            var channel = client.channels.cache.find(c => c.id === guild.Meta.LeaveMessageChannelID) as Discord.TextChannel;
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
            
            var channel = client.channels.cache.find(c => c.id === guild.Meta.LeaveMessageChannelID) as Discord.TextChannel;
            return await channel.send(embd);
        }
    }).catch(err => { logger.error("GuildMemberRemove Event Exception: ", err) });
});

client.on("RVoiceChannelJoin", async (channel, member) => {
    logger.info(`${member.id} joined voice channel ${channel.id} on ${channel.guild?.id}`);
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
                    var tx_c = channel.guild.channels.resolve(vl.TextChannelID) as TextChannel;
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
    });
});


client.on("RVoiceChannelQuit", async (channel, member) => {
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

    }).catch(err => logger.error("RVoiceChannelQuit Event Exception: ", err));
});

client.login("NjI3NDkyMTQyMjk3NjQ1MDU2.XY9bmA.4-3FITnIwAlSKE3mPWkLYv8baJs");