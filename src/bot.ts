import CommandsController from "./CommandsController";
import RClient from "./RClient";
import { sequelize } from "./Database";
import { Guild as RGuild } from "./Models/Guild";
import { User as RUser } from "./Models/User";
import log4js from "log4js";
import { ItemStack } from "./Models/Economy/ItemStack";

log4js.configure({
    appenders: {
        console:  { type: 'console' },
        file:     { type: 'file', filename: 'botlog.log' },
        database: { type: 'file', filename: 'sql.log' }
    },
    categories: {
        default:  { appenders: ['console', 'file'], level: 'info' },
        root:     { appenders: ['console', 'file'], level: 'info' },
        command:  { appenders: ['console', 'file'], level: 'info' },
        economy:  { appenders: ['console', 'file'], level: 'info' },
        database: { appenders: ['database'], level: 'info' }
    }
});

declare module 'discord.js' {
    interface ClientEvents {
        RVoiceChannelJoin: [VoiceChannel, GuildMember],
        RVoiceChannelQuit: [VoiceChannel, GuildMember],
        RVoiceChannelChange: [VoiceChannel, VoiceChannel, GuildMember],
        RGuildMemberAdd: [GuildMember, RGuild, RUser],
        RGuildMemberRemove: [GuildMember | PartialGuildMember, RGuild, RUser],
    }
}

const logger = log4js.getLogger("root");
const client = new RClient();
const commandsController = new CommandsController(client);

(async () => {
    await sequelize.sync({force: false});
    await RUser.findOrCreate({
        where: { 
            ID: "system" 
        }, 
        defaults: { 
            ID: "system", 
            Tag: "System",
            Avatar: "https://cdn.discordapp.com/avatars/571948993643544587/1ae2abe89523db2a74205763887e3e60.webp",
            Group: "Admin"
        }
    });
    logger.info(`Database Synchronized.`);
    logger.info(`Loggining to BOT Account...`);
    await client.login(process.env.TOKEN);
    logger.info(`Loggined In!`);
})();

client.once("ready", async () => {
    logger.info("BOT Ready.");

    logger.info(`[GC]`, "Starting guilds caching...");
    RGuild.findAll({
        where:{
            IsBanned: false
        }
    }).then(async guilds => {
        for(var i in guilds){
            await client.guilds.fetch(guilds[i].ID, true, true).catch(err => {
                if(err.code === 50001){
                    logger.warn(`[GC]`, guilds[i].ID, 'Guild Fetch Error: Missing Access');
                }else{
                    logger.warn(`[GC]`, 'Guild Fetch Error:', err);
                }
            });
            logger.info(`[GC]`, `Guild ${parseInt(i)+1}/${guilds.length}`);
        }
        logger.info(`[GC]`, `Cached ${guilds.length} guilds.`);
    }).catch(err => {
        logger.error(`[GC]`, 'Guilds Caching error:', err);
    });
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

    await commandsController.FindAndRun(message).catch(err => {
        logger.error(`[Cmd.Run]`, err);
    });
});

client.on("guildMemberAdd", async (member) => {
    logger.info(`[GuildMemberAddEvent] Guild[${member.guild.id}] Member[${member.id}] Event fired.`);
    RGuild.findOrCreate({
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
    }).then(async g => {
        logger.info(`[GuildMemberAddEvent] Guild[${member.guild.id}] Member[${member.id}] Guild data fetched.`);
        RUser.findOrCreate({
            where: {
                ID: member.id
            },
            defaults: {
                ID: member.id,
                Tag: member.user.tag,
                Avatar: member.user.avatarURL({ format: "png" }) || "No Avatar"
            }
        }).then(async u => {
            logger.info(`[GuildMemberAddEvent] Member[${member.id}] User data fetched.`);
            var guild = g[0];
            var user = u[0];
            client.emit("RGuildMemberAdd", member, guild, user);
        });
    }).catch(err => { logger.error(`[root] [GuildMemberAddEvent]`, err) });
});

client.on("guildMemberRemove", async (member) => {
    logger.info(`[GuildMemberRemoveEvent] Guild[${member.guild.id}] Member[${member.id}] Event fired.`);
    RGuild.findOrCreate({
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
    }).then(async g => {
        logger.info(`[GuildMemberRemoveEvent] Guild[${member.guild.id}] Member[${member.id}] Guild data fetched.`);
        RUser.findOrCreate({
            where: {
                ID: member.id
            },
            defaults: {
                ID: member.id,
                Tag: member.user?.tag,
                Avatar: member.user?.avatarURL({ format: "png" }) || "No Avatar"
            }
        }).then(async u => {
            logger.info(`[GuildMemberRemoveEvent] Member[${member.id}] User data fetched.`);
            var guild = g[0];
            var user = u[0];
            client.emit("RGuildMemberRemove", member, guild, user);
        });
    }).catch(err => { logger.error(`[GuildMemberRemoveEvent]`, err) });
});
