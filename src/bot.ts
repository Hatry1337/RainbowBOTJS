import CommandsController from "./CommandsController";
import RClient from "./RClient";
import { sequelize } from "./Database";
import { Guild as RGuild } from "./Models/Guild";
import { User as RUser } from "./Models/User";
import Economy from "./Commands/Economy/Commands/Economy";
import { GlobalLogger } from "./GlobalLogger";

declare module 'discord.js' {
    interface ClientEvents {
        RVoiceChannelJoin: [VoiceChannel, GuildMember],
        RVoiceChannelQuit: [VoiceChannel, GuildMember],
        RVoiceChannelChange: [VoiceChannel, VoiceChannel, GuildMember],
        RGuildMemberAdd: [GuildMember, RGuild, RUser],
        RGuildMemberRemove: [GuildMember | PartialGuildMember, RGuild, RUser],
    }
}

const logger = GlobalLogger.root;
const client = new RClient();
const commandsController = new CommandsController(client);

process.on("SIGINT", async () => {
    var eco = commandsController.Commands.find(c => c instanceof Economy) as Economy;
    await eco.saveWorld()
});

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
    logger.info(`Loggined In! (${client.user?.tag})`);
})();

client.once("ready", async () => {
    logger.info("BOT Ready.");

    logger.info(`[GC]`, "Starting guilds caching...");
    let i = 0;
    for(var g of client.guilds.cache){
        await client.guilds.fetch(g[0], true, true).catch(err => {
            if(err.code === 50001){
                logger.warn(`[GC]`, g[0], 'Guild Fetch Error: Missing Access');
            }else{
                logger.warn(`[GC]`, 'Guild Fetch Error:', err);
            }
        });
        i++;
        logger.info(`[GC]`, `Guild ${i}/${client.guilds.cache.size}`);
    }
    logger.info(`[GC]`, `Cached ${client.guilds.cache.size} guilds.`);

    logger.info(`Running Commands Inititalization...`);
    var inic = await commandsController.Init();
    logger.info(`Initialized ${inic} Commands Initializers.`);
    logger.info(`BOT Fully ready! Enjoy =)`);
});

client.on("voiceStateUpdate", async (vs1, vs2) => {
    if(!vs1.channel && vs2.channel && vs2.member){
        client.emit("RVoiceChannelJoin", vs2.channel, vs2.member);
        
        let trace = GlobalLogger.Trace(vs1, vs2);
        GlobalLogger.userlog.info(`${vs1.member} (${vs1.member?.user.tag}) joined ${vs2.channel} (${vs2.channel.name}) voice channel. TraceID: ${trace}`);
    }else if(vs1.channel && !vs2.channel && vs2.member){
        client.emit("RVoiceChannelQuit", vs1.channel, vs2.member);

        let trace = GlobalLogger.Trace(vs1, vs2);
        GlobalLogger.userlog.info(`${vs1.member} (${vs1.member?.user.tag}) leaved from ${vs1.channel} (${vs1.channel.name}) voice channel. TraceID: ${trace}`);
    }else if(vs1.channel && vs2.channel && vs2.member){
        client.emit("RVoiceChannelChange", vs1.channel, vs2.channel, vs2.member);
        if(vs1.channel.id !== vs2.channel.id){
            client.emit("RVoiceChannelQuit", vs1.channel, vs2.member);
            client.emit("RVoiceChannelJoin", vs2.channel, vs2.member);
        }

        let trace = GlobalLogger.Trace(vs1, vs2);
        GlobalLogger.userlog.info(`${vs1.member} (${vs1.member?.user.tag}) changed voice channel from ${vs1.channel} (${vs1.channel.name}) to ${vs2.channel} (${vs2.channel.name}). TraceID: ${trace}`);
    }
});

client.on('message', async message => {
    if(message.author.id === client.user?.id) return
    if(message.channel.type === "dm") { 
        await message.channel.send("Команды в личных сообщениях не поддерживаются :cry:"); 
        return; 
    }
    if(!message.member) return;
    if(message.author.bot) return;
    if(!message.content.startsWith("!")) return;

    let trace = GlobalLogger.Trace(message);
    GlobalLogger.userlog.info(`${message.member} (${message.member.user.tag}) requested command execution by typing "${message.content}". TraceID: ${trace}`);

    let response = await commandsController.FindAndRun(message).catch(err => {
        logger.error(`[Cmd.Run]`, err, `TraceID: ${GlobalLogger.Trace(err, message)}`);
    });
});

client.on("guildMemberAdd", async (member) => {
    let trace = GlobalLogger.Trace(member);
    GlobalLogger.userlog.info(`${member} (${member.user.tag}) joined guild ${member.guild} (${member.guild.name}). TraceID: ${trace}`);

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
    }).catch(err => { logger.error(`[root] [GuildMemberAddEvent]`, err, `TraceID: ${GlobalLogger.Trace(err)}`) });
});

client.on("guildMemberRemove", async (member) => {
    let trace = GlobalLogger.Trace(member);
    GlobalLogger.userlog.info(`${member} (${member.user?.tag}) leaved guild ${member.guild} (${member.guild.name}). TraceID: ${trace}`);
    
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
            var guild = g[0];
            var user = u[0];
            client.emit("RGuildMemberRemove", member, guild, user);
        });
    }).catch(err => { logger.error(`[GuildMemberRemoveEvent]`, err, `TraceID: ${GlobalLogger.Trace(err)}`) });
});
