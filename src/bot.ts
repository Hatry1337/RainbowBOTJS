import Discord, { TextChannel } from "discord.js";
import CommandsController from "./CommandsController";
import RClient from "./RClient";
import { sequelize } from "./Database";
import { Guild } from "./Models/Guild";
import { Colors } from "./Utils";
import log4js from "log4js";
import { MutedUser } from "./Models/MutedUser";

log4js.configure({
    appenders: {
        console: { type: 'console' },
        file: { type: 'file', filename: 'botlog.log' },
    },
    categories: {
        default: { appenders: ['console', 'file'], level: 'info' }
    }
});

const logger = log4js.getLogger();
const client = new RClient();
const commandsController = new CommandsController();

(async () => {
    await sequelize.sync({force: false});
    logger.info(`DB Synced.`);
})();

client.once("ready", async () => {
    logger.info("Bot started.");

    logger.info("Starting guilds caching...");
    Guild.findAll({
        where:{
            IsBanned: false
        }
    }).then(async guilds => {
        for(var i in guilds){
            await client.guilds.fetch(guilds[i].ID, true, true);
            logger.info(`Cached ${parseInt(i)+1}/${guilds.length}`);
        }
    });

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

        if(guild.JoinRolesIDs.length > 0){
            var roles:Discord.Role[] = [];
            for(var i in guild.JoinRolesIDs){
                var role = await member.guild.roles.fetch(guild.JoinRolesIDs[i]);
                if(role){
                    roles.push(role);
                }else{
                    guild.JoinRolesIDs.splice(parseInt(i), 1);
                }
            }
            await Guild.update({ JoinRolesIDs: guild.JoinRolesIDs }, { where: { ID: guild.ID } }).catch(err => logger.error(err));
            if(!roles.find(r => !r.editable)){
                await member.roles.add(roles);
            }else{
                var channel: Discord.TextChannel;
                if(guild.LogChannelID){
                    channel = client.channels.cache.find(c => c.id === guild.LogChannelID) as Discord.TextChannel;
                }else{
                    channel = member.guild.systemChannel as TextChannel;
                }
                await channel?.send(`${channel.guild.owner?.user}, RainbowBOT don't have permissons to add one of selected roles to joined user. Make RainbowBOT's role upper than join roles.`);
            }
        }

        if(!guild.IsJoinMessageEnabled || !guild.JoinMessageChannelID){
            return;
        }

        if(guild.Meta.jmgr_msg){
            var msg_settings = guild.Meta.jmgr_msg;
            msg_settings.Title = msg_settings.Title?.replace(/%user%/g, member.user.toString());
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

    }).catch(err => { throw err });
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

        if(!guild.IsJoinMessageEnabled || !guild.JoinMessageChannelID){
            return;
        }

        var embd = new Discord.MessageEmbed({
            title: `${member.user?.tag} leaved from server!`,
            color: Colors.Warning
        });
        var avatar_url = member.user?.avatarURL();
        if(avatar_url){
            embd.thumbnail = { url: avatar_url }
        }
        
        var channel = client.channels.cache.find(c => c.id === guild.JoinMessageChannelID) as Discord.TextChannel;
        return await channel.send(embd);
    }).catch(err => { throw err });
});




client.login("NjI3NDkyMTQyMjk3NjQ1MDU2.XY9bmA.4-3FITnIwAlSKE3mPWkLYv8baJs");