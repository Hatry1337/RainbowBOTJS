import { Guild, GuildMember, Message, PartialGuildMember, VoiceState } from "discord.js";
import RClient from "./RClient";
import { Guild as RGuild } from "./Models/Guild";
import { User as RUser } from "./Models/User";
import { GlobalLogger } from "./GlobalLogger";

const logger = GlobalLogger.root;

export default class Events{
    public Client: RClient;

    constructor(cli: RClient) {
        this.Client = cli;
        this.Client.Events = this;

        this.Client.once(   "ready",                this.onceReady.bind(this));
        this.Client.on(     "message",              this.onMessage.bind(this));
        this.Client.on(     "guildCreate",          this.onGuildCreate.bind(this));
        this.Client.on(     "guildUpdate",          this.onGuildUpdate.bind(this));
        this.Client.on(     "voiceStateUpdate",     this.onVoiceStateUpdate.bind(this));
        this.Client.on(     "guildMemberAdd",       this.onGuildMemberAdd.bind(this));
        this.Client.on(     "guildMemberRemove",    this.onGuildMemberRemove.bind(this));
    }

    private async onceReady(){
        logger.info("BOT Ready.");

        logger.info("Running guilds caching...");
        let cachec = await this.Client.CacheGuilds(true);
        logger.info(`Cached ${cachec} guilds.`);
    
        logger.info(`Running Commands Inititalization...`);
        var inic = await this.Client.CommandsController.Init();
        logger.info(`Initialized ${inic} Commands Initializers.`);
        logger.info(`BOT Fully ready! Enjoy =)`);
    }

    private async onMessage(message: Message){
        if(message.author.id === this.Client.user?.id) return
        if(message.channel.type === "dm") { 
            await message.channel.send("Команды в личных сообщениях не поддерживаются :cry:"); 
            return; 
        }
        if(!message.member) return;
        if(message.author.bot) return;
        if(!message.content.startsWith("!")) return;
    
        let trace = GlobalLogger.Trace(message);
        GlobalLogger.userlog.info(`${message.member} (${message.member.user.tag}) requested command execution by typing "${message.content}". TraceID: ${trace}`);
    
        let response = await this.Client.CommandsController.FindAndRun(message).catch(err => {
            logger.error(`[Cmd.Run]`, err, `TraceID: ${GlobalLogger.Trace(err, message)}`);
        });
    }


    private onGuildCreate(guild: Guild){
        RGuild.findOrCreate({
            where: {
                ID: guild.id
            },
            defaults: {
                ID: guild.id,
                Name: guild.name,
                OwnerID: guild.ownerID,
                Region: guild.region,
                SystemChannelID: guild.systemChannelID,
                JoinRolesIDs: [],
            }
        }).then(async res => {
            if(res[1]){
                let g = res[0];
                g.Name = guild.name;
                g.OwnerID = guild.ownerID;
                g.Region = guild.region;
                g.SystemChannelID = guild.systemChannelID ? guild.systemChannelID : undefined;
                await g.save();
            }
        });
    }

    private onGuildUpdate(old_guild: Guild, new_guild: Guild){
        RGuild.findOrCreate({
            where: {
                ID: old_guild.id
            },
            defaults: {
                ID: new_guild.id,
                Name: new_guild.name,
                OwnerID: new_guild.ownerID,
                Region: new_guild.region,
                SystemChannelID: new_guild.systemChannelID,
                JoinRolesIDs: [],
            }
        }).then(async res => {
            if(res[1]){
                let g = res[0];
                g.Name = new_guild.name;
                g.OwnerID = new_guild.ownerID;
                g.Region = new_guild.region;
                g.SystemChannelID = new_guild.systemChannelID ? new_guild.systemChannelID : undefined;
                await g.save();
            }
        });
    }

    private onVoiceStateUpdate(vs1: VoiceState, vs2: VoiceState){
        if(!vs1.channel && vs2.channel && vs2.member){
            this.Client.emit("RVoiceChannelJoin", vs2.channel, vs2.member);
            
            let trace = GlobalLogger.Trace(vs1, vs2);
            GlobalLogger.userlog.info(`${vs1.member} (${vs1.member?.user.tag}) joined ${vs2.channel} (${vs2.channel.name}) voice channel. TraceID: ${trace}`);
        }else if(vs1.channel && !vs2.channel && vs2.member){
            this.Client.emit("RVoiceChannelQuit", vs1.channel, vs2.member);
    
            let trace = GlobalLogger.Trace(vs1, vs2);
            GlobalLogger.userlog.info(`${vs1.member} (${vs1.member?.user.tag}) leaved from ${vs1.channel} (${vs1.channel.name}) voice channel. TraceID: ${trace}`);
        }else if(vs1.channel && vs2.channel && vs2.member){
            this.Client.emit("RVoiceChannelChange", vs1.channel, vs2.channel, vs2.member);
            if(vs1.channel.id !== vs2.channel.id){
                this.Client.emit("RVoiceChannelQuit", vs1.channel, vs2.member);
                this.Client.emit("RVoiceChannelJoin", vs2.channel, vs2.member);
            }
    
            let trace = GlobalLogger.Trace(vs1, vs2);
            GlobalLogger.userlog.info(`${vs1.member} (${vs1.member?.user.tag}) changed voice channel from ${vs1.channel} (${vs1.channel.name}) to ${vs2.channel} (${vs2.channel.name}). TraceID: ${trace}`);
        }
    }

    private onGuildMemberAdd(member: GuildMember){
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
                this.Client.emit("RGuildMemberAdd", member, guild, user);
            });
        }).catch(err => { logger.error(`[root] [GuildMemberAddEvent]`, err, `TraceID: ${GlobalLogger.Trace(err)}`) });
    }

    private onGuildMemberRemove(member: GuildMember | PartialGuildMember){
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
                this.Client.emit("RGuildMemberRemove", member, guild, user);
            });
        }).catch(err => { logger.error(`[GuildMemberRemoveEvent]`, err, `TraceID: ${GlobalLogger.Trace(err)}`) });
    }
}