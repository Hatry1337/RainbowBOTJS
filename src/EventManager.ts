import Discord, { ButtonInteraction, Client, Guild, GuildMember, Message, PartialGuildMember, VoiceState } from "discord.js";
import { Guild as RGuild } from "./Models/Guild";
import { GlobalLogger } from "./GlobalLogger";
import RainbowBOT from "./RainbowBOT";
import User from "./Structures/User";

const logger = GlobalLogger.root;

export type ButtonInteractionCallback = (interaction: ButtonInteraction) => Promise<void>;

export default class EventManager{
    private buttonSubscriptions: Map<string, ButtonInteractionCallback> = new Map;

    constructor(public bot: RainbowBOT) {
        this.bot.client.once(   "ready",                this.onceReady.bind(this));
        //this.Client.on(     "message",              this.onMessage.bind(this));
        this.bot.client.on(     "guildCreate",          this.onGuildCreate.bind(this));
        this.bot.client.on(     "guildUpdate",          this.onGuildUpdate.bind(this));
        this.bot.client.on(     "voiceStateUpdate",     this.onVoiceStateUpdate.bind(this));
        this.bot.client.on(     "guildMemberAdd",       this.onGuildMemberAdd.bind(this));
        this.bot.client.on(     "guildMemberRemove",    this.onGuildMemberRemove.bind(this));
        this.bot.client.on(     "interactionCreate",    this.onInteractionCreate.bind(this))
    }
    
    public ButtonEventSubscribe(cus_id: string, callback: ButtonInteractionCallback){
        this.buttonSubscriptions.set(cus_id, callback);
    }

    public ButtonEventUnSubscribe(cus_id: string){
        this.buttonSubscriptions.delete(cus_id);
    }

    private async onInteractionCreate(interaction: Discord.Interaction){
        if(interaction.isCommand()){
            this.bot.modules.FindAndRun(interaction).catch(err => GlobalLogger.root.error("Error Running Module:", err));
        }
        if(interaction.isButton()){
            for(let e of this.buttonSubscriptions.entries()){
                if(interaction.customId === e[0]){
                    return e[1](interaction).catch(err => GlobalLogger.root.error("Error Executing Button Callback:", err));;
                }
            }
        }
    }

    private async onceReady(){
        logger.info("BOT Ready.");

        logger.info("Running guilds caching...");
        let cachec = await this.bot.CacheGuilds(true);
        logger.info(`Cached ${cachec} guilds.`);

        logger.info(`Running Commands Inititalization...`);
        await this.bot.modules.data.loadFromStorage();
        await this.bot.config.get("amogus", "sus"); // This is for underlying data container fetching (container is sus lmfao)

        var inic = await this.bot.modules.Init().catch(err => GlobalLogger.root.error("[Ready Event] Error intializing modules:", err));
        if(!inic){
            logger.error("Fatal error occured. Can't load modules.");
        }else{
            logger.info(`Initialized ${inic} Commands Initializers.`);
            logger.info(`BOT Fully ready! Enjoy =)`);    
        }
    }
    /*
    private async onMessage(message: Message){
        if(message.author.id === this.bot.client.user?.id) return
        if(message.channel.type === "DM") { 
            await message.channel.send("Команды в личных сообщениях не поддерживаются :cry:"); 
            return; 
        }
        if(!message.member) return;
        if(message.author.bot) return;
        if(!message.content.startsWith("!")) return;
    
        let trace = GlobalLogger.Trace(message);
        GlobalLogger.userlog.info(`${message.member} (${message.member.user.tag}) requested command execution by typing "${message.content}". TraceID: ${trace}`);
    
        let response = await this.BOT.moduleManager.FindAndRun(message).catch(err => {
            logger.error(`[Cmd.Run]`, err, `TraceID: ${GlobalLogger.Trace(err, message)}`);
        });
    }
    */

    private onGuildCreate(guild: Guild){
        RGuild.findOrCreate({
            where: {
                ID: guild.id
            },
            defaults: {
                ID: guild.id,
                Name: guild.name,
                OwnerID: guild.ownerId,
                Region: guild.preferredLocale,
                SystemChannelID: guild.systemChannelId,
                JoinRolesIDs: [],
            }
        }).then(async res => {
            if(res[1]){
                let g = res[0];
                g.Name = guild.name;
                g.OwnerID = guild.ownerId;
                g.Region = guild.preferredLocale;
                g.SystemChannelID = guild.systemChannelId ? guild.systemChannelId : undefined;
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
                OwnerID: new_guild.ownerId,
                Region: new_guild.preferredLocale,
                SystemChannelID: new_guild.systemChannelId,
                JoinRolesIDs: [],
            }
        }).then(async res => {
            if(res[1]){
                let g = res[0];
                g.Name = new_guild.name;
                g.OwnerID = new_guild.ownerId;
                g.Region = new_guild.preferredLocale;
                g.SystemChannelID = new_guild.systemChannelId ? new_guild.systemChannelId : undefined;
                await g.save();
            }
        });
    }

    private onVoiceStateUpdate(vs1: VoiceState, vs2: VoiceState){
        if(!vs1.channel && vs2.channel && vs2.member){
            this.bot.client.emit("RVoiceChannelJoin", vs2.channel, vs2.member);

            let trace = GlobalLogger.Trace(vs1, vs2);
            GlobalLogger.userlog.info(`${vs1.member} (${vs1.member?.user.tag}) joined ${vs2.channel} (${vs2.channel.name}) voice channel. TraceID: ${trace}`);
        }else if(vs1.channel && !vs2.channel && vs2.member){
            this.bot.client.emit("RVoiceChannelQuit", vs1.channel, vs2.member);
    
            let trace = GlobalLogger.Trace(vs1, vs2);
            GlobalLogger.userlog.info(`${vs1.member} (${vs1.member?.user.tag}) leaved from ${vs1.channel} (${vs1.channel.name}) voice channel. TraceID: ${trace}`);
        }else if(vs1.channel && vs2.channel && vs2.member){
            this.bot.client.emit("RVoiceChannelChange", vs1.channel, vs2.channel, vs2.member);
            if(vs1.channel.id !== vs2.channel.id){
                this.bot.client.emit("RVoiceChannelQuit", vs1.channel, vs2.member);
                this.bot.client.emit("RVoiceChannelJoin", vs2.channel, vs2.member);
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
                OwnerID: member.guild?.ownerId,
                Region: member.guild?.preferredLocale,
                SystemChannelID: member.guild?.systemChannelId,
                JoinRolesIDs: [],
            }
        }).then(async g => {
            logger.info(`[GuildMemberAddEvent] Guild[${member.guild.id}] Member[${member.id}] Guild data fetched.`);
            logger.info(`[GuildMemberAddEvent] Member[${member.id}] User data fetched.`);
            var guild = g[0];
            let user_id = this.bot.users.idFromDiscordId(member.id);
            let user: User | null = null;
            if(user_id){
                user = await this.bot.users.fetchOne(user_id);
            }
            if(!user){
                user = await this.bot.users.createFromDiscord(member.user);
            }
            this.bot.client.emit("RGuildMemberAdd", member, guild, user);
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
                OwnerID: member.guild?.ownerId,
                Region: member.guild?.preferredLocale,
                SystemChannelID: member.guild?.systemChannelId,
                JoinRolesIDs: [],
            }
        }).then(async g => {
            var guild = g[0];
            let user_id = this.bot.users.idFromDiscordId(member.id);
            let user: User | null = null;
            if(user_id){
                user = await this.bot.users.fetchOne(user_id);
            }
            if(!user){
                user = await this.bot.users.createFromDiscord(member.user);
            }
            this.bot.client.emit("RGuildMemberRemove", member, guild, user);
        }).catch(err => { logger.error(`[GuildMemberRemoveEvent]`, err, `TraceID: ${GlobalLogger.Trace(err)}`) });
    }
}