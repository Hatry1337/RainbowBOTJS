import EventEmitter from "events";
import Discord, { VoiceChannel } from "discord.js";
import { MusicManager } from "../../Models/MusicManager";
import { TrackOptions } from "./TrackOptions";
import got from "got";
import ytdl from "ytdl-core";
import { PassThrough } from "stream";

export class Player extends EventEmitter{
    client: Discord.Client;
    music_manager: MusicManager;
    Guild!: Discord.Guild;
    TextChannel!: Discord.TextChannel | null;
    PlayerMessage!: Discord.Message;
    QueueMessage!: Discord.Message;
    DJRole!: Discord.Role | null;
    VoiceConnection!: Discord.VoiceConnection | null;
    isPlaying: boolean;
    isRepeated: boolean;

    constructor(music_manager: MusicManager, client: Discord.Client){
        super();
        this.client = client;
        this.music_manager = music_manager;
        this.isPlaying = music_manager.is_playing;
        this.isRepeated = music_manager.is_repeated;
    }

    Init(){
        return new Promise<void>(async (resolve, reject) => {
            await this.music_manager.reload();
            this.Guild = await this.client.guilds.fetch(this.music_manager.guild_id);
            this.TextChannel = await this.Guild.channels.resolve(this.music_manager.music_channel_id) as Discord.TextChannel;
            this.PlayerMessage = await this.TextChannel.messages.fetch(this.music_manager.music_message_id);
            this.QueueMessage = await this.TextChannel.messages.fetch(this.music_manager.queue_message_id);
            this.DJRole = await this.Guild.roles.fetch(this.music_manager.dj_role_id);
            return resolve();
        });
    }

    GetQueue(){
        return new Promise<TrackOptions[]>(async (resolve, reject) => {
            await this.music_manager.reload();
            return resolve(this.music_manager.queue);
        });
    }

    GetCurrentTrack(){
        return new Promise<TrackOptions | undefined>(async (resolve, reject) => {
            await this.music_manager.reload();
            return resolve(this.music_manager.current_track);
        });
    }


    SetCurrentTrack(track: TrackOptions | null){
        return new Promise<void>(async (resolve, reject) => {
            await this.music_manager.reload();
            this.music_manager.set("current_track", track);
            this.music_manager = await this.music_manager.save();
            return resolve();
        });
    }

    QueueShift(){
        return new Promise<TrackOptions | undefined>(async (resolve, reject) => {
            await this.music_manager.reload();
            var q = this.music_manager.queue;
            var t = q.shift();
            this.music_manager.set("queue", q);
            await MusicManager.update({
                queue: q
            }, {
                where: {
                    id: this.music_manager.id
                }
            });
            return resolve(t);
        });
    }

    QueueAdd(track: TrackOptions){
        return new Promise<void>(async (resolve, reject) => {
            await this.music_manager.reload();
            var q = this.music_manager.queue;
            q.push(track);
            this.music_manager.set("queue", q);
            this.music_manager = await this.music_manager.save();
            return resolve();
        });
    }

    QueueAddTracks(tracks: TrackOptions[]){
        return new Promise<void>(async (resolve, reject) => {
            await this.music_manager.reload();
            var q = this.music_manager.queue;
            this.music_manager.queue = q.concat(tracks);
            this.music_manager = await this.music_manager.save();
            return resolve();
        });
    }

    QueueClear(){
        return new Promise<void>(async (resolve, reject) => {
            await this.music_manager.reload();
            this.music_manager.set("queue", []);
            this.music_manager = await this.music_manager.save();
            return resolve();
        });
    }

    QueueShuffle(){
        return new Promise<void>(async (resolve, reject) => {
            await this.music_manager.reload();

            var q = this.music_manager.queue;
            var copy: TrackOptions[] = []
            var n = q.length;
            var i;
            while (n) {
                i = Math.floor(Math.random() * n--);
                copy.push(q.splice(i, 1)[0]);
            }
            this.music_manager.set("queue", copy);
            this.music_manager = await this.music_manager.save();
            return resolve();
        });
    }

    ChangeState(state: boolean){
        return new Promise<void>(async (resolve, reject) => {
            this.isPlaying = state;
            await MusicManager.update({
                is_playing: this.isPlaying
            },{
                where:{
                    id: this.music_manager.id
                }
            });
            return resolve();
        });
    }

    Repeat(state: boolean){
        return new Promise<void>(async (resolve, reject) => {
            this.isRepeated = state;
            await MusicManager.update({
                is_repeated: this.isRepeated
            },{
                where:{
                    id: this.music_manager.id
                }
            });
            return resolve();
        });
    }

    Play(track: TrackOptions | undefined, voiceChannel: Discord.VoiceChannel){
        return new Promise<void>(async (resolve, reject) => {
            if(!voiceChannel){
                return resolve();
            }

            if(!track){
                track = await this.QueueShift();
                if(!track){
                    await this.Stop(voiceChannel);
                    return resolve();
                }
            }

            if(!this.VoiceConnection){
                this.VoiceConnection = await voiceChannel.join();
            }

            await this.SetCurrentTrack(track);
            await this.ChangeState(true);
      
            if(track.isRadio){
                var stream = new PassThrough();
                await got(track.url, {
                    isStream: true
                }).pipe(stream);
                this.VoiceConnection.play(stream);
            }else {
                this.VoiceConnection.play(ytdl(track.url, { filter: "audioonly" }), { volume: 0.125 });
            }
            this.emit("started");
            this.VoiceConnection.dispatcher.once('finish', async () => {
                if(!this.isRepeated){
                    track = await this.QueueShift();
                }
                this.emit("finished");
                this.Play(track, voiceChannel);
            });
            return resolve();
        });
    }

    Pause(voiceChannel: Discord.VoiceChannel){
        return new Promise<void>(async (resolve, reject) => {
            if(!voiceChannel){
                return resolve();
            }

            if(this.VoiceConnection){
                this.VoiceConnection.channel.leave();
                this.VoiceConnection.disconnect();
                this.VoiceConnection = null;
            }
            await this.ChangeState(false);
            
            this.emit("paused");
            return resolve();
        });
    }

    Stop(voiceChannel: Discord.VoiceChannel){
        return new Promise<void>(async (resolve, reject) => {
            if(!voiceChannel){
                return resolve();
            }

            if(this.VoiceConnection){
                this.VoiceConnection.channel.leave();
                this.VoiceConnection.disconnect();
                this.VoiceConnection = null;
            }
            await this.SetCurrentTrack(null);
            await this.QueueClear();
            await this.ChangeState(false);
            
            this.emit("stopped");
            return resolve();
        });
    }

    Skip(voiceChannel: VoiceChannel){
        return new Promise<void>(async (resolve, reject) => {
            if(!voiceChannel){
                return resolve();
            }
            this.Play(await this.QueueShift(), voiceChannel);
            return resolve();
        });
    }
}