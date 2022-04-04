import Discord from "discord.js";
import { Access, Colors, GlobalLogger, GuildOnlyError, MissingPermissionsError, Module, RainbowBOT, RainbowBOTUserError, User, Utils } from "rainbowbot-core";

interface VSession{
    Channel: Discord.VoiceChannel;
    Member: Discord.GuildMember;
    StartedAt: Date;
}

interface DataToSave{
    ChannelID: string;
    ChannelName: string;
    GuildID: string;
    MemberID: string;
    Time: number;
}

export default class VoiceStats extends Module{
    public Name:        string = "VoiceStats";
    public Description: string = "Using this command you can view voice channels stats in this server.";
    public Category:    string = "Utility";
    public Author:      string = "Thomasss#9258";

    public Access: string[] = [ Access.PLAYER() ];

    private CurrentSessions: Map<string, VSession> = new Map();
    private DataToSave: DataToSave[] = [];
    private save_timer?: NodeJS.Timeout;

    constructor(bot: RainbowBOT, UUID: string) {
        super(bot, UUID);
        this.SlashCommands.push(
            this.bot.interactions.createCommand("vcstats", this.Access, this, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
                .setDescription(this.Description)
                .addChannelOption(opt => opt
                    .setName("channel")
                    .setDescription("Channel to watch top on.")
                    .setRequired(false)
                )
                .addStringOption(opt => opt
                    .setName("guild_id")
                    .setDescription("Guild ID to watch top on.")
                    .setRequired(false)
                )
                .onExecute(this.Run.bind(this))
                .commit(),
        );
    }

    private async onRVoiceChannelJoin(channel: Discord.VoiceChannel, member: Discord.GuildMember){
        let session = this.CurrentSessions.get(member.id);

        if(!session){
            if(channel.id === channel.guild.afkChannelId || member.user.bot){
                return;
            }

            this.CurrentSessions.set(member.id, {
                Channel: channel,
                Member: member,
                StartedAt: new Date()
            });
        }else{
            this.Logger.Info(`[JoinEvent] Wtf why session exists on join?!! Debug this shit pls... trace id is: ${GlobalLogger.Trace({channel, member})}`);
        }
    }
    
    private async onRVoiceChannelQuit(channel: Discord.VoiceChannel, member: Discord.GuildMember){
        let session = this.CurrentSessions.get(member.id);

        if(session){
            this.DataToSave.push({
                ChannelID: session.Channel.id,
                ChannelName: session.Channel.name,
                GuildID: session.Channel.guild.id,
                MemberID: session.Member.id,
                Time: Math.floor((new Date().getTime() - session.StartedAt.getTime()) / 1000)
            });
            this.CurrentSessions.delete(member.id);
        }
    }


    public async Init(){
        let loadc = 0;
        let channels = this.bot.client.channels.cache.filter(c => c instanceof Discord.VoiceChannel) as Discord.Collection<string, Discord.VoiceChannel>;
        for(let c of channels){
            if(c[1].id === c[1].guild.afkChannelId){
                continue;
            }
            for(let m of c[1].members){
                this.CurrentSessions.set(m[1].id, {
                    Channel: c[1],
                    Member: m[1],
                    StartedAt: new Date()
                });
                loadc++;
            }
        }

        this.Logger.Info(`[Init] Loaded ${loadc} members from cache.`);

        let sc = 0;
        this.save_timer = setInterval(async () => {
            if(sc >= 5){
                this.Logger.Info(`[SaveTimer] Saving current sessions...`);
                for(let e of this.CurrentSessions){
                    let session = e[1];
                    this.DataToSave.push({
                        ChannelID: session.Channel.id,
                        ChannelName: session.Channel.name,
                        GuildID: session.Channel.guild.id,
                        MemberID: session.Member.id,
                        Time: Math.floor((new Date().getTime() - session.StartedAt.getTime()) / 1000)
                    });
                    this.CurrentSessions.set(session.Member.id, {
                        Channel: session.Channel,
                        Member: session.Member,
                        StartedAt: new Date()
                    });
                }
                sc = 0;
            }
            await this.SaveData();
            sc++;
        }, 60 * 1000);

        this.bot.events.addListener("VoiceChannelJoin", this.onRVoiceChannelJoin.bind(this));
        this.bot.events.addListener("VoiceChannelQuit", this.onRVoiceChannelQuit.bind(this));
    }

    public async UnLoad(){
        this.Logger.Info(`Unloading '${this.Name}' module:`);

        this.Logger.Info("Unsubscribing from 'VoiceChannelJoin' Event...")
        this.bot.events.removeListener("VoiceChannelJoin", this.onRVoiceChannelJoin);

        this.Logger.Info("Unsubscribing from 'VoiceChannelQuit' Event...")
        this.bot.events.removeListener("VoiceChannelQuit", this.onRVoiceChannelQuit);

        if(this.save_timer){
            clearInterval(this.save_timer);
        }

        for(let e of this.CurrentSessions){
            let session = e[1];
            this.DataToSave.push({
                ChannelID: session.Channel.id,
                ChannelName: session.Channel.name,
                GuildID: session.Channel.guild.id,
                MemberID: session.Member.id,
                Time: Math.floor((new Date().getTime() - session.StartedAt.getTime()) / 1000)
            });
            this.CurrentSessions.delete(session.Member.id);
        }

        await this.SaveData();
    }

    private async SaveData(){
        this.Logger.Info(`[SaveData] Saving data to storage...`);
        let crtd = 0;
        let updd = 0;

        let container = await this.bot.modules.data.getContainer(this.UUID);
        let stats: DataToSave[] = container.get("voice_stats") || [];

        let d: DataToSave | undefined;
        while(d = this.DataToSave.pop()){
            let vsd = stats.find(v => v.ChannelID === d?.ChannelID && v.GuildID === d.GuildID && v.MemberID === d.MemberID);
            if(!vsd){
                stats.push(d);
                crtd++;
            }else{
                vsd.ChannelName = d.ChannelName;
                vsd.Time = d.Time;
                updd++;
            }
        }
        container.set("voice_stats", stats);

        this.Logger.Info(`[SaveData] Created ${crtd}, updated ${updd} entries.`);
    }

    public async Run(interaction: Discord.CommandInteraction, user: User){
        if(!(interaction.inGuild() || interaction.inCachedGuild()) || !interaction.guild){
            throw new GuildOnlyError();
        }

        let trg_channel  = interaction.options.getChannel("channel");
        let trg_guild_id = interaction.options.getString("guild_id");
        
        let targetGuild: Discord.Guild | null;

        if(!trg_guild_id || !Utils.valID(trg_guild_id)){
            trg_guild_id = interaction.guild.id;
            targetGuild = interaction.guild;
        }else{
            if(!user.groups.includes(Access.ADMIN())){
                throw new MissingPermissionsError();
            }
            targetGuild = this.bot.client.guilds.resolve(trg_guild_id);
        }

        if(!targetGuild){
            throw new RainbowBOTUserError("Can't find this guild.");
        }

        let container = await this.bot.modules.data.getContainer(this.UUID);
        let stats: DataToSave[] = container.get("voice_stats") || [];

        let membs: DataToSave[];
        if(!trg_channel){
            membs = stats.filter(s => s.GuildID === trg_guild_id);
        }else{
            membs = stats.filter(s => s.GuildID === trg_guild_id && s.ChannelID === trg_channel?.id);
        }

        let usermap: Map<string, number> = new Map();

        for(let m of membs){
            if(!usermap.has(m.MemberID)){
                usermap.set(m.MemberID, m.Time);
            }else{
                usermap.set(m.MemberID, usermap.get(m.MemberID)! + m.Time);
            }
        }

        let mtimetotal = [...usermap.entries()].sort((a, b) => b[1] - a[1]);

        let stat = "";
        let i = 1;
        for(let e of mtimetotal){
            stat += `${i}. ${this.bot.client.users.cache.get(e[0])} - ${Utils.formatTime(e[1])} in voice channels\n`;
            if(i >= 10){
                break;
            }
            i++;
        }

        let embd = new Discord.MessageEmbed({
            title: `Voice Channels Stats on ${targetGuild.name}`,
            description: stat || "There is no Voice Channels Stats.",
            color: Colors.Noraml
        });

        let uindex = mtimetotal.findIndex(e => e[0] === interaction.user.id);
        if(uindex !== -1){
            embd.setFooter({
                text: `You're on the ${uindex + 1} place. (${Utils.formatTime(mtimetotal[uindex][1])} in voice channels)`,
                iconURL: interaction.user.avatarURL() || undefined
            });
        }

        return await interaction.reply({ embeds: [ embd ] })
    }
}