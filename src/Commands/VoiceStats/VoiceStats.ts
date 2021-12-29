import Discord, { OverwriteResolvable, PermissionOverwrites } from "discord.js";
import ICommand from "../ICommand";
import { Guild } from "../../Models/Guild";
import { Utils, Emojis, Colors } from "../../Utils";
import CommandsController from "../../CommandsController";
import log4js from "log4js";
import { VoiceLobby } from "../../Models/VoiceLobby";
import { GlobalLogger } from "../../GlobalLogger";
import { VoiceStatsData } from "../../Models/VoiceStatsData";
import sequelize from "sequelize";

const logger = log4js.getLogger("command");

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

export default class VoiceStats implements ICommand{
    public Name:        string = "VoiceStats";
    public Trigger:     string = "!vcstats";
    public Usage:       string = "`!vcstats[ <sub_cmd> ...]`\n\n" +
                          "**Subcommands:**\n" 

                          
    public Description: string = "Using this command you can view voice channels stats in this server.";
    public Category:    string = "Utility";
    public Author:      string = "Thomasss#9258";
    public Controller: CommandsController;

    private CurrentSessions: Map<string, VSession> = new Map();
    private DataToSave: DataToSave[] = [];
    private save_timer?: NodeJS.Timeout;

    constructor(controller: CommandsController) {
        this.Controller = controller;
    }

    private async onRVoiceChannelJoin(channel: Discord.VoiceChannel, member: Discord.GuildMember){
        let session = this.CurrentSessions.get(member.id);

        if(!session){
            this.CurrentSessions.set(member.id, {
                Channel: channel,
                Member: member,
                StartedAt: new Date()
            });
        }else{
            logger.warn(`[${this.Name}] [JoinEvent] Wtf why session exists on join?!! Debug this shit pls... trace id is: ${GlobalLogger.Trace({channel, member})}`);
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

    async Init(){
        let loadc = 0;
        let channels = this.Controller.Client.channels.cache.filter(c => c instanceof Discord.VoiceChannel) as Discord.Collection<string, Discord.VoiceChannel>;
        for(let c of channels){
            for(let m of c[1].members){
                this.CurrentSessions.set(m[1].id, {
                    Channel: c[1],
                    Member: m[1],
                    StartedAt: new Date()
                });
                loadc++;
            }
        }

        logger.info(`[${this.Name}] [Init] Loaded ${loadc} members from cache.`);

        this.save_timer = setInterval(async () => {
            await this.SaveData();
        }, 60 * 1000);

        this.Controller.Client.on("RVoiceChannelJoin", this.onRVoiceChannelJoin.bind(this));
        this.Controller.Client.on("RVoiceChannelQuit", this.onRVoiceChannelQuit.bind(this));
    }

    async UnLoad(){
        logger.info(`Unloading '${this.Name}' module:`);
        logger.info("Unsubscribing from 'RVoiceChannelJoin' Event...")
        this.Controller.Client.removeListener("RVoiceChannelJoin", this.onRVoiceChannelJoin);

        logger.info("Unsubscribing from 'RVoiceChannelQuit' Event...")
        this.Controller.Client.removeListener("RVoiceChannelQuit", this.onRVoiceChannelQuit);

        if(this.save_timer){
            clearInterval(this.save_timer);
        }

        await this.SaveData();
    }

    SaveData(){
        return new Promise<void>(async (resolve, reject) => {
            logger.info(`[${this.Name}] [SaveData] Saving data to storage...`);
            let crtd = 0;
            let updd = 0;

            let d;
            while(d = this.DataToSave.pop()){
                let vsd = await VoiceStatsData.findOne({
                    where: {
                        UserID: d.MemberID,
                        GuildID: d.GuildID,
                        ChannelID: d.ChannelID
                    }
                }).catch(reject);
                if(!vsd){
                    await VoiceStatsData.create({
                        UserID: d.MemberID,
                        ChannelID: d.ChannelID,
                        ChannelName: d.ChannelName,
                        GuildID: d.GuildID,
                        VoiceTime: d.Time
                    }).catch(reject);
                    crtd++;
                }else{
                    await VoiceStatsData.update({
                        UserID: d.MemberID,
                        ChannelID: d.ChannelID,
                        ChannelName: d.ChannelName,
                        GuildID: d.GuildID,
                        VoiceTime: vsd.VoiceTime + d.Time
                    }, {
                        where: {
                            UserID: d.MemberID,
                            GuildID: d.GuildID,
                            ChannelID: d.ChannelID
                        }
                    }).catch(reject);
                    updd++;
                }
            }
            logger.info(`[${this.Name}] [SaveData] Created ${crtd}, updated ${updd} entries.`);
        });
    }

    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!vcstats");
    }
    
    Run(message: Discord.Message, guild: Guild){
        return new Promise<Discord.Message>(async (resolve, reject) => {
            var args = message.content.split(" ").slice(1);
            
            switch(args[0]){
                default: {
                    let membs = await VoiceStatsData.findAll({
                        where: {
                            GuildID: guild.ID
                        }
                    });
                    let usermap: Map<string, number> = new Map();

                    for(let m of membs){
                        if(!usermap.has(m.UserID)){
                            usermap.set(m.UserID, m.VoiceTime);
                        }else{
                            usermap.set(m.UserID, usermap.get(m.UserID)! + m.VoiceTime);
                        }
                    }

                    let mtimetotal = [...usermap.entries()].sort((a, b) => b[1] - a[1]);

                    let stat = "";
                    let i = 1;
                    for(let e of mtimetotal){
                        stat += `${i}. ${this.Controller.Client.users.cache.get(e[0])?.tag} - ${Utils.formatTime(e[1])} in voice channels\n`;
                        if(i === 10){
                            break;
                        }
                    }

                    let uindex = mtimetotal.findIndex(e => e[0] === message.author.id);
                    if(uindex !== -1){
                        stat += `\nYou're on the ${uindex + 1} place.`;
                    }

                    var embd = new Discord.MessageEmbed({
                        title: `Voice Channels Stats on ${message.guild?.name}`,
                        description: stat,
                        color: Colors.Noraml
                    });

                    return resolve(await message.channel.send(embd));
                    break;
                }
            }
        });
    }
}