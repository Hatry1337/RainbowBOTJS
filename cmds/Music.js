const RainbowBOT = require("../modules/RainbowBOT");
const Database = require("../modules/Database");
const Discord = require("discord.js");
const User = require("../modules/User");
const { MusicManager } = require("../modules/Models");
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const PassThrough = require('stream').PassThrough;
const querystring = require("querystring");
const Request = require("request-promise");
const { EventEmitter } = require("events");

class Track{
    /**
     * @param {object} options
     */
    constructor(options){
        /**
         * @type {string}
         */
        this.title = options.title;
        /**
         * @type {string}
         */
        this.url = options.url;
        /**
         * @type {number}
         */
        this.duration = options.duration || options.length;
        this.thumbnail = {
            /**
             * @type {string}
             */
            url: options.thumbnail.url,
            /**
             * @type {number}
             */
            width: options.thumbnail.width,
            /**
             * @type {number}
             */
            height: options.thumbnail.height,
        };
        this.timestamp = new Date();
        /**
         * @type {boolean}
         */
        this.isRadio = options.isRadio;
    }

    static Create(options) {
        if(!options || !options.title){
            return null;
        }
        return new Track(options);
    }

    toObject(){
        return {
            title: this.title,
            url: this.url,
            duration: this.duration,
            thumbnail: {
                url: this.thumbnail.url,
                width: this.thumbnail.width,
                height: this.thumbnail.height
            },
            timestamp: this.timestamp,
            isRadio: this.isRadio
        }
    }
}


class Player extends EventEmitter{
    /**
     * @param {MusicManager} music_manager 
     * @param {RainbowBOT} rbot 
     */
    constructor(music_manager, rbot){
        super();
        /**
         * @type {RainbowBOT}
         */
        this.rbot = rbot;
        /**
         * @type {number}
         */
        this.id = music_manager.get("id");
        /**
         * @type {Discord.Guild}
         */
        this.Guild = null;
        /**
         * @type {Discord.TextChannel}
         */
        this.TextChannel = null;
        /**
         * @type {Discord.Message}
         */
        this.PlayerMessage = null;
        /**
         * @type {Discord.Message}
         */
        this.QueueMessage = null;
        /**
         * @type {Discord.Role}
         */
        this.DJRole = null;
        /**
         * @type {Discord.VoiceConnection}
         */
        this.VoiceConnection = null;
        /**
         * @type {boolean}
         */
        this.isPlaying = music_manager.get("is_playing");
        /**
         * @type {boolean}
         */
        this.isRepeated = music_manager.get("is_repeated")
    }

    /**
     * @returns {Promise<void>}
     */
    Init(){
        return new Promise(async (resolve, reject) => {
            var mm = await MusicManager.findOne({
                where:{
                    id: this.id
                }
            });
            this.Guild = await this.rbot.Client.guilds.fetch(mm.get("guild_id"));
            this.TextChannel = await this.Guild.channels.resolve(mm.get("music_channel_id"));
            this.PlayerMessage = await this.TextChannel.messages.fetch(mm.get("music_message_id"));
            this.QueueMessage = await this.TextChannel.messages.fetch(mm.get("queue_message_id"));
            this.DJRole = await this.Guild.roles.fetch(mm.get("dj_role_id"));
            resolve();
        });
    }

    /**
     * @returns {Promise<Array<Track>>}
     */
    GetQueue(){
        return new Promise(async (resolve, reject) => {
            var manager = await MusicManager.findOne({
                where: {
                    id: this.id
                }
            });
            var q = manager.get("queue");
            var queue = [];
            for(var i in q){
                queue.push(Track.Create(q[i]));
            }
            resolve(queue);
        });
    }

    /**
     * @returns {Promise<Track>}
     */
    GetCurrentTrack(){
        return new Promise(async (resolve, reject) => {
            var manager = await MusicManager.findOne({
                where: {
                    id: this.id
                }
            });
            resolve(Track.Create(manager.get("current_track")));
        });
    }

    /**
     * @param {Track} track
     * @returns {Promise<void>}
     */
    SetCurrentTrack(track){
        return new Promise(async (resolve, reject) => {
            var trw;
            track ? trw = track.toObject() : trw = null;

            await MusicManager.update({
                current_track: trw
            }, {
                where: {
                    id: this.id
                }
            });
            resolve();
        });
    }

    /**
     * @returns {Promise<Track>}
     */
    QueueShift(){
        return new Promise(async (resolve, reject) => {
            var manager = await MusicManager.findOne({
                where: {
                    id: this.id
                }
            });
            var q = manager.get("queue");
            var t = q.shift();
            await MusicManager.update({
                queue: q
            },{
                where:{
                    id: this.id
                }
            });
            resolve(Track.Create(t));
        });
    }

    /**
     * @param {Track} track
     * @returns {Promise<void>}
     */
    QueueAdd(track){
        return new Promise(async (resolve, reject) => {
            var manager = await MusicManager.findOne({
                where: {
                    id: this.id
                }
            });
            var q = manager.get("queue");
            q.push(track.toObject());
            await MusicManager.update({
                queue: q
            },{
                where:{
                    id: this.id
                }
            });
            resolve();
        });
    }

    /**
     * @returns {Promise<void>}
     */
    QueueClear(){
        return new Promise(async (resolve, reject) => {
            await MusicManager.update({
                queue: []
            },{
                where:{
                    id: this.id
                }
            });
            resolve();
        });
    }

    /**
     * @returns {Promise<void>}
     */
    QueueShuffle(){
        return new Promise(async (resolve, reject) => {
            var manager = await MusicManager.findOne({
                where: {
                    id: this.id
                }
            });
            var array = manager.get("queue");
            var copy = [], n = array.length, i;
            while (n) {
                i = Math.floor(Math.random() * n--);
                copy.push(array.splice(i, 1)[0]);
            }
            await MusicManager.update({
                queue: copy
            },{
                where:{
                    id: this.id
                }
            });
            resolve();
        });
    }

    /**
     * @param {boolean} state
     * @returns {Promise<void>}
     */
    ChangeState(state){
        return new Promise(async (resolve, reject) => {
            this.isPlaying = state;
            await MusicManager.update({
                is_playing: this.isPlaying
            },{
                where:{
                    id: this.id
                }
            });
            resolve();
        });
    }

    /**
     * @param {boolean} state
     * @returns {Promise<void>}
     */
    Repeat(state){
        return new Promise(async (resolve, reject) => {
            this.isRepeated = state;
            await MusicManager.update({
                is_repeated: this.isRepeated
            },{
                where:{
                    id: this.id
                }
            });
            resolve();
        });
    }

    /**
     * 
     * @param {Track} track 
     * @param {Discord.VoiceChannel} voiceChannel
     * @returns {Promise<void>}
     */
    Play(track, voiceChannel){
        return new Promise(async (resolve, reject) => {
            if(!voiceChannel){
                resolve();
                return;
            }

            if(!track){
                track = await this.QueueShift();
                console.log(track);
                if(!track){
                    await this.Stop(voiceChannel);
                    resolve();
                    return;
                }
            }

            if(!this.VoiceConnection){
                this.VoiceConnection = await voiceChannel.join();
            }

            await this.SetCurrentTrack(track);
            await this.ChangeState(true);
      
            if(track.isRadio){
                var stream = new PassThrough();
                await Request(track.url, { forever: true }).pipe(stream);
                this.VoiceConnection.play(stream);
            }else {
                this.VoiceConnection.play(ytdl(track.url, { filter: "audioonly" }));
            }
            this.emit("started");
            this.VoiceConnection.dispatcher.once('finish', async () => {
                if(!this.isRepeated){
                    track = await this.QueueShift();
                }
                this.emit("finished");
                this.Play(track, voiceChannel);
            });
            resolve();
        });
    }

    /**
     * @param {Discord.VoiceChannel} voiceChannel
     * @returns {Promise<void>}
     */
    Pause(voiceChannel){
        return new Promise(async (resolve, reject) => {
            if(!voiceChannel){
                resolve();
                return;
            }

            if(this.VoiceConnection){
                this.VoiceConnection.channel.leave();
                this.VoiceConnection.disconnect();
                this.VoiceConnection = null;
            }
            await this.ChangeState(false);
            
            this.emit("paused");
            resolve();
        });
    }

    /**
     * @param {Discord.VoiceChannel} voiceChannel
     * @returns {Promise<void>}
     */
    Stop(voiceChannel){
        return new Promise(async (resolve, reject) => {
            if(!voiceChannel){
                resolve();
                return;
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
            resolve();
        });
    }

    /**
     * @param {Discord.VoiceChannel} voiceChannel
     * @returns {Promise<void>}
     */
    Skip(voiceChannel){
        return new Promise(async (resolve, reject) => {
            if(!voiceChannel){
                resolve();
                return;
            }
            
            this.Play(null, voiceChannel);
            resolve();
        });
    }
}




class Music {
    /**
     * @param {RainbowBOT} rbot 
     */
    constructor(rbot){
        this.Name = "Music";
        this.rbot = rbot;
        this.lng = rbot.localization;
        /**
         * @type {Map<string, Player>}
         */
        this.Players = new Map();

        this.rbot.on('command', async (message, user) => {
            if (message.content.startsWith(`!music`)) {
                if (message.content.startsWith(`!music setup`)) {
                    if(message.member.permissions.has("ADMINISTRATOR")){
                        await this.exec_setup(message, user);
                    }else{
                        await message.channel.send("You don't have permissions to do this.");
                        return;
                    }
                }
            }
        });

        this.rbot.on("music_reaction", async (member, reaction, manager) => {
            var plr = this.Players.get(reaction.message.guild.id);
            if(!plr){
                plr = new Player(manager, this.rbot);
                await plr.Init();
                plr.on("started", async () => {
                    await this.update_queue(manager);
                });
                this.Players.set(reaction.message.guild.id, plr);
            }
            switch(reaction.emoji.name){
                case "⏯":{
                    if(plr.isPlaying){
                        await plr.Pause(member.voice.channel);
                    }else{
                        await plr.Play(await plr.GetCurrentTrack(), member.voice.channel);
                    }
                    await this.update_queue(manager);
                    await reaction.users.remove(member.id);
                    break;
                };

                case "⏹":{
                    await plr.Stop(member.voice.channel);
                    await this.update_queue(manager);
                    await reaction.users.remove(member.id);
                    break;
                };

                case "⏭":{
                    await plr.Skip(member.voice.channel);
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
            }
        });

        this.rbot.on("music_message", async (member, message, manager) => {
            await this.exec_add_track(message, manager);
        });

        console.log(`Module "${this.Name}" loaded!`)
    }

    /**
     * 
     * @param {Discord.Message} message Discord Message object
     * @param {User} user RainbowBOT User object
     * @returns {Promise<Discord.Message>}
     */
    exec_setup(message, user) {
        return new Promise(async (resolve, reject) => {
            var manager = await MusicManager.findOne({
                where: {
                    guild_id: message.guild.id
                }
            });

            if(!manager){
                var role = await message.guild.roles.create({
                    data: {
                        name: 'Rainbow DJ',
                        color: 0xFF00FF,
                      },
                    reason: 'We need new DJ Role'
                });
                var channel = await message.guild.channels.create("RainbowBOT Music", { 
                    type: "text",
                    topic: "⏯ - play/pause\n⏹ - stop player and clear queue\n⏭ - skip current track\n🔂 - repeat current track\n🔀 - shuffle current playlist\n<:igniblprpl:727513115633123415> - Add tracks from RainbowBOT Chart\n\nTo add track in playlist you need to send youtube URI in this channel.",
                    permissionOverwrites: [
                        {
                            id: message.guild.roles.everyone.id,
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
                    guild_id: message.guild.id,
                    music_message_id: react_message.id,
                    music_channel_id: channel.id,
                    queue_message_id: queue_message.id,
                    dj_role_id: role.id,
                    is_playing: false,
                    is_repeated: false,
                    queue: []
                });
            }
        });
    }

    /**
     * 
     * @param {string} raw String with any youtube link, or with search query
     * @returns {Promise<string>}
     */
    extractURL(raw){
        return new Promise(async (resolve, reject) => {
            var reg1 = /http(s)?:\/\/(www\.)?youtube\.com\/watch\?v=(.*)/g;
            var reg2 = /http(s)?:\/\/(www\.)?youtu\.be\/(.*)/g;
            var code;
            if(raw.match(reg1)){
                var matches = reg1.exec(raw);
                code = matches[matches.length-1];
            }else if(raw.match(reg2)){
                var matches = reg2.exec(raw);
                code = matches[matches.length-1];
            }
            if(code){
                resolve("https://www.youtube.com/watch?v="+code);
            }else {
                var filters = await ytsr.getFilters(raw);
                var filter = filters.get('Type').get('Video');
                var res = await ytsr(filter.url, {
                    limit: 1, 
                    safeSearch: false, 
                    //nextpageRef: filter.ref
                });
                resolve(res.items[0].url);
            }
        });
    }


    /**
     * @param {MusicManager} manager
     * @returns {Promise<Discord.Message>}
     */
    update_queue(manager) {
        return new Promise(async (resolve, reject) => {
            var plr = this.Players.get(manager.get("guild_id"));
            if(!plr){
                plr = new Player(manager, this.rbot);
                await plr.Init();
                this.Players.set(reaction.message.guild.id, plr);
            }

            var queue = await plr.GetQueue();
            var qstr = "Next Tracks:\n";
            if(queue.length === 0){
                qstr += "`Empty`";
            }else{
                for(var i in queue){
                    qstr += `${i}. ${queue[i].title} \`${this.rbot.Utils.secondsToDhms(queue[i].duration)}\`\n`;
                }
            }

            var curr = await plr.GetCurrentTrack();
            if(curr){
                var embd = new Discord.MessageEmbed({
                    title: `RainbowBOT Music Player ${plr.isPlaying ? "▶" : "⏸"} ${plr.isRepeated ? "🔂" : ""}`,
                    color: 0x00a7ff
                })
                    .setImage(curr.thumbnail.url)
                    .setDescription(`[${curr.title}](${curr.url}) ${this.rbot.Utils.secondsToDhms(curr.duration)}`);
                await plr.PlayerMessage.edit(embd);
            }else{
                var embd = new Discord.MessageEmbed({
                    title: `RainbowBOT Music Player ${plr.isPlaying ? "▶" : "⏸"} ${plr.isRepeated ? "🔂" : ""}`,
                    color: 0x00a7ff
                }).setImage("https://cdn.discordapp.com/attachments/575271861643116555/796329363305922610/-1.png");
                await plr.PlayerMessage.edit(embd);
            }
            resolve (await plr.QueueMessage.edit(qstr));
        });
    }

    /**
     * 
     * @param {Discord.Message} message Discord Message object
     * @param {MusicManager} manager MusicManager object
     * @returns {Promise<Discord.Message>}
     */
    exec_add_track(message, manager) {
        return new Promise(async (resolve, reject) => {
            const voiceChannel = message.member.voice.channel;
            if(!voiceChannel){
                var ms = await message.channel.send(this.lng.Music.niChannel["en"]);
                await message.delete({timeout: 5000});
                resolve(await ms.delete({timeout: 5000}));
                return;
            }
            var url = await this.extractURL(message.content);
            var songInfo = await ytdl.getInfo(url);
            var song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url,
                length: parseInt(songInfo.videoDetails.lengthSeconds),
                thumbnail: songInfo.videoDetails.thumbnails.pop(),
                timestamp: new Date(),
                isRadio: false
            }

            var plr = this.Players.get(message.guild.id);
            if(!plr){
                plr = new Player(manager, this.rbot);
                await plr.Init();
                plr.on("started", async () => {
                    await this.update_queue(manager);
                });
                this.Players.set(message.guild.id, plr);
            }
            
            await plr.QueueAdd(Track.Create(song));
            if(!plr.isPlaying){
                plr.Play(null, voiceChannel);
            }
            await message.delete();
            resolve(await this.update_queue(manager));
        });
    }

}

module.exports = Music;
