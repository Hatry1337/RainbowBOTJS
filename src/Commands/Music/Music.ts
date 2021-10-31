import Discord from "discord.js";
import { MusicManager } from "../../Models/MusicManager";
import ICommand from "../ICommand";
import { Guild } from "../../Models/Guild";
import { Emojis, Colors, Utils } from "../../Utils";
import CommandsController from "../../CommandsController";
import log4js from "log4js";
import { Player } from "./Player";
import ytsr from "ytsr";
import ytpl from "ytpl";
import ytdl from "ytdl-core";
import { Thumbnail, TrackOptions } from "./TrackOptions";

const logger = log4js.getLogger();

class Music implements ICommand{
    Name:        string = "Music";
    Trigger:     string = "!music";
    Usage:       string = "`!music <sub_cmd> ...`\n\n" +
                          "**Subcommands:**\n" +
                          "`!music setup`\n\n";

    Description: string = "Using this command admins can configure RainbowBOT Music Player on this guild.";
    Category:    string = "Utility";
    Author:      string = "Thomasss#9258";
    Controller: CommandsController

    Players = new Map<string, Player>();

    constructor(controller: CommandsController) {
        this.Controller = controller;

        this.Controller.Client.on("voiceStateUpdate", async (oldState, newState)=>{
            var oldchannel = oldState.channel;
            if(newState.member?.id === this.Controller.Client.user?.id){return;}
            if(!oldState.channel?.members.has(this.Controller.Client.user?.id || "")){return;}
            if(oldState.channel.members.size <= 1){
                setTimeout(async()=>{
                    if(!oldchannel) {return}
                    if(oldchannel.members.size <= 1){
                        var plr = this.Players.get(oldchannel.guild.id);
                        if(plr && plr.isPlaying){
                            await plr.Pause(oldchannel);
                            var manager = await MusicManager.findOne({
                                where: {
                                    guild_id: oldchannel.guild.id
                                }
                            });
                            if(!manager) {return}
                            this.update_queue(manager);
                        }
                    }
                }, 20000);
            }
        });

        this.Controller.Client.on('message', async message => {
            if(message.author.id === this.Controller.Client.user?.id){return}
            if(!message.guild) {return}
            var manager = await MusicManager.findOne({
                where: {
                    music_channel_id: message.channel.id
                }
            });
            if(manager){
                if(message.member?.roles.cache.get(manager.get("dj_role_id"))){
                    await this.exec_add_track(message, manager).catch(async err => {
                        await message.delete().catch(err => logger.warn("[MusicPlayer] MessageEventCatchBlock.MessageDeletionError: ", err));
                        logger.error("[MusicPlayer] Add track error: ", err, "MusicManager: ", manager, "Message: ", message);
                        var embd = new Discord.MessageEmbed({
                            title: `${Emojis.RedErrorCross} Unexpected error occured. Please contact with bot's support.`,
                            color: Colors.Error
                        });
                        return await message.channel.send(embd);
                    });
                }else{
                    await message.delete().catch(err => logger.warn("[MusicPlayer] MessageEvent.MessageDeletionError: ", err));
                }
            }
        });

        this.Controller.Client.on("messageReactionAdd", async (reaction, user) => {
            if(user.id === this.Controller.Client.user?.id){return}
            var manager = await MusicManager.findOne({
                where: {
                    music_message_id: reaction.message.id
                }
            });
            if(manager){
                var member = reaction.message.guild?.member(user.id);
                if(member?.roles.cache.get(manager.get("dj_role_id"))){
                    if(!reaction.message.guild) {return await reaction.users.remove(user.id);}

                    var plr = this.Players.get(reaction.message.guild.id);
                    if(!plr){
                        plr = new Player(manager, this.Controller.Client);
                        await plr.Init();
                        plr.on("started", async () => {
                            await this.update_queue(manager!);
                        });
                        this.Players.set(reaction.message.guild.id, plr);
                    }
                    var vc = member.voice.channel;
                    if(!vc) {return await reaction.users.remove(user.id);}

                    switch(reaction.emoji.name){
                        case "⏯":{
                            if(plr.isPlaying){
                                await plr.Pause(vc);
                            }else{
                                await plr.Play(await plr.GetCurrentTrack(), vc);
                            }
                            await this.update_queue(manager);
                            await reaction.users.remove(member.id);
                            break;
                        };

                        case "⏹":{
                            await plr.Stop(vc);
                            await this.update_queue(manager);
                            await reaction.users.remove(member.id);
                            break;
                        };

                        case "⏭":{
                            await plr.Skip(vc);
                            await this.update_queue(manager);
                            await reaction.users.remove(member.id);
                            break;
                        };

                        case "🔂":{
                            await plr.Repeat(!plr.isRepeated);
                            await this.update_queue(manager);
                            await reaction.users.remove(member.id);
                            break;
                        };

                        case "🔀":{
                            await plr.QueueShuffle();
                            await this.update_queue(manager);
                            await reaction.users.remove(member.id);
                            break;
                        };

                        case "igniblprpl":{
                            await plr.QueueShuffle();
                            await this.update_queue(manager);
                            await reaction.users.remove(member.id);
                            break;
                        };
                    }
                }else{
                    await reaction.users.remove(user.id);
                }
            }
        });

        this.Controller.Client.on("ready", async () => {
            logger.info("[MMC] Starting MusicManagers caching...");
            var managers = await MusicManager.findAll();
            for(var i in managers){
                var ch = await this.Controller.Client.channels.fetch(managers[i].get("music_channel_id")).catch(async e => {
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
        });
    }
    
    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!music");
    }
    
    Run(message: Discord.Message){
        return new Promise<Discord.Message>(async (resolve, reject) => {
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
                    if(!message.member?.hasPermission("ADMINISTRATOR")){
                        var embd = new Discord.MessageEmbed({
                            title: `${Emojis.RedErrorCross} Only administrators can use this command.`,
                            color: Colors.Error
                        });
                        return resolve(await message.channel.send(embd));
                    }
                    
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
                        var guild = message.guild;
                        if(!guild){
                            var embd = new Discord.MessageEmbed({
                                title: `${Emojis.RedErrorCross} This command is not allowed in dm.`,
                                color: Colors.Error
                            });
                            return resolve(await message.channel.send(embd));
                        }

                        var manager = await MusicManager.findOne({
                            where: {
                                guild_id: guild.id
                            }
                        });
            
                        if(!manager){
                            var role = await guild.roles.create({
                                data: {
                                    name: 'Rainbow DJ',
                                    color: 0xFF00FF,
                                  },
                                reason: 'We need new DJ Role!'
                            });
                            var channel = await guild.channels.create("RainbowBOT Music", { 
                                type: "text",
                                topic: "⏯ - play/pause\n⏹ - stop player and clear queue\n⏭ - skip current track\n🔂 - repeat current track\n🔀 - shuffle current playlist\n<:igniblprpl:727513115633123415> - Add tracks from RainbowBOT Chart\n\nTo add track in playlist you need to send youtube URI in this channel.",
                                permissionOverwrites: [
                                    {
                                        id: guild.roles.everyone.id,
                                        deny: "SEND_MESSAGES"
                                    },
                                    {
                                        id: role.id,
                                        allow: "SEND_MESSAGES"
                                    }
                                ]
                            });
                            var embd = new Discord.MessageEmbed({
                                title: "RainbowBOT Music Player",
                                color: 0x00a7ff
                            }).setImage("https://cdn.discordapp.com/attachments/575271861643116555/796329363305922610/-1.png");
            
                            
                            var react_message = await channel.send(embd);
                            await react_message.react("⏯");
                            await react_message.react("⏹");
                            await react_message.react("⏭");
                            await react_message.react("🔂");
                            await react_message.react("🔀");
                            await react_message.react("igniblprpl:727513115633123415");
                            var queue_message = await channel.send("Next Tracks:\n`Empty`")
            
                            manager = await MusicManager.create({
                                guild_id: guild.id,
                                music_message_id: react_message.id,
                                music_channel_id: channel.id,
                                queue_message_id: queue_message.id,
                                dj_role_id: role.id,
                                is_playing: false,
                                is_repeated: false,
                                queue: []
                            });

                            var embd = new Discord.MessageEmbed({
                                title: `Successfully configured RainbowBOT Music Player`,
                                description: `Now RainbowBOT Music Player available in ${channel}`,
                                color: Colors.Success
                            });
                            return resolve(await message.channel.send(embd));
                        }
                    }).catch(async res => {
                        logger.error(res);
                        var embd = new Discord.MessageEmbed({
                            title: `${Emojis.RedErrorCross} Unexpected error occured. Please contact with bot's support.`,
                            color: Colors.Error
                        });
                        return resolve(await message.channel.send(embd));
                    });
                }
            }
        });
    }

    private update_queue(manager: MusicManager) {
        return new Promise(async (resolve, reject) => {
            var plr = this.Players.get(manager.get("guild_id"));
            if(!plr){
                plr = new Player(manager, this.Controller.Client);
                await plr.Init();
                this.Players.set(manager.get("guild_id"), plr);
            }

            var queue = await plr.GetQueue();
            var qstr = "Next Tracks:\n";
            if(queue.length === 0){
                qstr += "`Empty`";
            }else{
                for(var i in queue){
                    if((qstr + `${i}. ${queue[i].title} \`${Utils.secondsToDhms(queue[i].duration)}\`\n`).length < 1950){
                        qstr += `${i}. ${queue[i].title} \`${Utils.secondsToDhms(queue[i].duration)}\`\n`;
                    }else{
                        qstr += "And some other tracks...";
                        break;
                    }
                }
            }

            var curr = await plr.GetCurrentTrack();
            if(curr){
                var embd = new Discord.MessageEmbed({
                    title: `RainbowBOT Music Player ${plr.isPlaying ? "▶" : "⏸"} ${plr.isRepeated ? "🔂" : ""}`,
                    color: 0x00a7ff
                })
                    .setImage(curr.thumbnail.url)
                    .setDescription(`[${curr.title}](${curr.url}) ${Utils.secondsToDhms(curr.duration)}`);
                await plr.PlayerMessage.edit(embd);
            }else{
                var embd = new Discord.MessageEmbed({
                    title: `RainbowBOT Music Player ${plr.isPlaying ? "▶" : "⏸"} ${plr.isRepeated ? "🔂" : ""}`,
                    color: 0x00a7ff
                }).setImage("https://static.rainbowbot.xyz/pictures/rbot/music/empty.png");
                await plr.PlayerMessage.edit(embd);
            }
            resolve (await plr.QueueMessage.edit(qstr));
        });
    }

    private extractURL(raw: string){
        return new Promise<string | null>(async (resolve, reject) => {
            var reg1 = /http(s)?:\/\/(www\.)?youtube\.com\/watch\?v=(.*)/g;
            var reg2 = /http(s)?:\/\/(www\.)?youtu\.be\/(.*)/g;
            var code;
            if(raw.match(reg1)){
                var matches = reg1.exec(raw);
                if(!matches){
                    return resolve(null);
                }
                code = matches[matches.length-1];
            }else if(raw.match(reg2)){
                var matches = reg2.exec(raw);
                if(!matches){
                    return resolve(null);
                }
                code = matches[matches.length-1];
            }
            if(code){
                resolve("https://www.youtube.com/watch?v="+code);
            }else {
                var filters = await ytsr.getFilters(raw).catch(console.log);
                var filter = filters?.get('Type')?.get('Video');
                if(!filter || !filter.url){
                    return resolve(null);
                }
                await ytsr(filter.url, {
                    limit: 1, 
                    safeSearch: false, 
                    //nextpageRef: filter.ref
                }).then((res) => {
                    var vid = res.items[0] as ytsr.Video;
                    resolve(vid.url);
                }).catch(() => {
                    resolve(null)
                });
            }
        });
    }

    private extractPlaylist(url: string){
        return new Promise<string[]>(async (resolve, reject) => {
            var reg1 = /http(s)?:\/\/(www\.)?youtube\.com\/playlist\?list=(.*)/g;
            var matches = reg1.exec(url);
            if(matches){
                var code = matches[matches.length-1];
                if(code){
                    ytpl(code).then((playlist) => {
                        var urls = [];
                        for(var vid of playlist.items){
                            urls.push(vid.url);
                        }
                        resolve(urls);
                    }).catch(() => {
                        resolve([]);
                        return;
                    });
                }else{
                    resolve([]);
                }
            }else{
                resolve([]);
            }
        });
    }

    private exec_add_track(message: Discord.Message, manager: MusicManager) {
        return new Promise(async (resolve, reject) => {
            const voiceChannel = message.member?.voice.channel;
            if(!voiceChannel){
                var ms = await message.channel.send("You're not in the voice channel!");
                await message.delete({timeout: 5000}).catch(err => logger.warn("[MusicPlayer] ExecAddTrack.MessageDeletionError: ", err));
                return resolve(await ms.delete({timeout: 5000}).catch(err => logger.warn("[MusicPlayer] ExecAddTrack.MessageDeletionError: ", err)));
            }
            
            var urls = await this.extractPlaylist(message.content);
            if(urls.length === 0){
                var url;
                if(message.content.startsWith("-rbfm")){
                    url = message.content;
                }else{
                    url = await this.extractURL(message.content);
                }
                if(url){
                    urls.push(url);
                }
            }

            var plr = this.Players.get(message.guild?.id || "");
            if(!plr){
                plr = new Player(manager, this.Controller.Client);
                await plr.Init();
                plr.on("started", async () => {
                    await this.update_queue(manager);
                });
                plr.on("stopped", async () => {
                    await this.update_queue(manager);
                });
                this.Players.set(message.guild?.id || "", plr);
            }
            
            var q = await plr.GetQueue();
            var ctr = q.length;
            var tracks = [];
            for(var vid of urls){
                if(ctr >= 100){
                    var ms = await message.channel.send("Max tracks in queue - 100!");
                    resolve(await ms.delete({timeout: 5000}).catch(err => logger.warn("[MusicPlayer] ExecAddTrack.MessageDeletionError: ", err)));
                    break;
                }
                if(vid){
                    if(message.content.startsWith("-rbfm")){
                        var song: TrackOptions = {
                            title: "RainbowFM Live Broadcast",
                            url: "https://air.rainbowbot.xyz",
                            duration: 60 * 60 * 2,
                            thumbnail: {
                                url: "https://static.rainbowbot.xyz/pictures/rbot/music/rbfm.png",
                                width: 1920,
                                height: 1080
                            },
                            timestamp: new Date(),
                            isRadio: true
                        }
                        tracks.push(song);
                    }else{
                        var songInfo = await ytdl.getBasicInfo(vid);
                        var song: TrackOptions = {
                            title: songInfo.videoDetails.title,
                            url: songInfo.videoDetails.video_url,
                            duration: parseInt(songInfo.videoDetails.lengthSeconds),
                            thumbnail: songInfo.videoDetails.thumbnails.pop() as Thumbnail,
                            timestamp: new Date(),
                            isRadio: false
                        }
                        tracks.push(song);
                    }
                    ctr++;
                }
            }
            await plr.QueueAddTracks(tracks);
            if(!plr.isPlaying){
                plr.Play(undefined, voiceChannel);
            }
            await message.delete().catch(err => logger.warn("[MusicPlayer] ExecAddTrack.MessageDeletionError: ", err));
            resolve(await this.update_queue(manager));
        });
    }
}

export = Music;