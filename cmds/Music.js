var moduleName = "Music";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class Song{
    constructor(title, url, dur, thumb, started, isRadio, lang){
        this.title = title;
        this.url = url;
        this.duration = dur;
        this.thumbnail = thumb;
        this.startedTS = started;
        this.isRadio = isRadio;
        this.lang = lang;
    }
}
class ServerQueue {
    constructor(textc, voicec, volume, playing, repeated) {
        this.textChannel = textc;
        this.voiceChannel = voicec;
        this.connection = null;
        this.songs = [];
        this.current = null;
        this.volume = volume;
        this.playing = playing;
        this.repeated = repeated;
    }
}


class Music {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
        this.SecDHMS = Utils.secondsToDhms;
        this.Request = Utils.RequestPromise;
        this.ytdl = require('ytdl-core');
        this.ytsr = require('ytsr');
        this.PassThrough = require('stream').PassThrough;
        this.queue = new Map();
        this.lng = Utils.lng;
        this.querystring = require("querystring");

        this.ytsr.do_warn_deprecate = false;
    }
    extractURL = async function(raw, callback){
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
            callback("https://www.youtube.com/watch?v="+code);
        }else {
            var othis = this;
            var uri = `http://youtube-scrape.herokuapp.com/api/search?${this.querystring.stringify({q: raw, page: 1})}`;
            this.Request(uri, (err, data) => {
                var parsed = JSON.parse(data.body);
                callback(parsed.results[0].video.url);
            });
            /*
            this.ytsr.getFilters(raw).then(async filters => {
                var filter = filters.get('Type').find(o => o.name === 'Video');
                othis.ytsr(raw, {limit: 1, safeSearch: false, nextpageRef: filter.ref}).then(async res => {
                    callback(res.items[0].link);
                });
            });
            */
        }
    };
    executePlay = async function (message, serverQueue, lang) {
        const sch_req = message.content.substr(6);
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel){
            message.channel.send(this.lng.Music.niChannel[lang]);
            return;
        }
        var res = null;
        var othis = this;
        await othis.extractURL(sch_req, async function (songUrl) {
            const songInfo = await othis.ytdl.getInfo(songUrl);
            const song = new Song(
                songInfo.title,
                songInfo.video_url,
                songInfo.length_seconds,
                songInfo.playerResponse.videoDetails.thumbnail.thumbnails.pop(),
                new Date(),
                false,
                lang
            );
            if (!serverQueue) {
                const queueConstruct = new ServerQueue(
                    message.channel,
                    voiceChannel,
                    5,
                    true,
                    false
                );
                othis.queue.set(message.guild.id, queueConstruct);
                queueConstruct.songs.push(song);
                try {
                    var connection = await voiceChannel.join();
                    queueConstruct.connection = connection;
                    await othis.Play(message.guild, queueConstruct.songs[0], lang);
                } catch (err) {
                    console.log(err);
                    othis.queue.delete(message.guild.id);
                    return message.channel.send(err);
                }
            } else {
                serverQueue.songs.push(song);
                return await othis.ShowQueue(message.channel, serverQueue, lang)
            }

        });
    };

    executePlayList = async function(message, serverQueue, lang) {
        var searchRequests = message.content.substr(7).split(";;");
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel){
            message.channel.send(this.lng.Music.niChannel[lang]);
            return;
        }
        var othis = this;
        if (!serverQueue) {
            const queueContruct = new ServerQueue(
                message.channel,
                voiceChannel,
                5,
                true,
                false
            );
            othis.queue.set(message.guild.id, queueContruct);
            serverQueue = queueContruct;
        }
        searchRequests.forEach(async (val, i, arr)=>{
            await othis.extractURL(val, async function (songUrl) {
                const songInfo = await othis.ytdl.getInfo(songUrl);
                const song = new Song(
                    songInfo.title,
                    songInfo.video_url,
                    songInfo.length_seconds,
                    songInfo.playerResponse.videoDetails.thumbnail.thumbnails.pop(),
                    new Date(),
                    false,
                    lang
                );
                serverQueue.songs.push(song);
                if(i === searchRequests.length-1){
                    try {
                        var connection = await voiceChannel.join();
                        serverQueue.connection = connection;
                        await othis.Play(message.guild, serverQueue.songs[0], lang);
                    } catch (err) {
                        console.log(err);
                        othis.queue.delete(message.guild.id);
                        return message.channel.send(err);
                    }
                }
            });
        });
    };

    executeRadio = async function(message, serverQueue, lang) {
        var voiceChannel = message.member.voice.channel;
        if(!voiceChannel){
            message.channel.send(this.lng.Music.niChannel[lang]);
            return;
        }
        const song = new Song(
            "RainbowFM",
            "https://air.rainbowbot.xyz",
            36000,
            {
                url: "https://media.discordapp.net/attachments/612222713716801537/722382264427610154/rbfm200.png",
                width: 200,
                height: 200,
            },
            new Date(),
            true,
            lang
        );
        var othis = this;
        if (!serverQueue) {
            const queueContruct = new ServerQueue(
                message.channel,
                voiceChannel,
                5,
                true,
                false
            );
            this.queue.set(message.guild.id, queueContruct);
            queueContruct.songs.push(song);
            try {
                var connection = await voiceChannel.join();
                queueContruct.connection = connection;
                await othis.Play(message.guild, queueContruct.songs[0], lang);
            } catch (err) {
                console.log(err);
                othis.queue.delete(message.guild.id);
                return message.channel.send(err);
            }
        } else {
            serverQueue.songs.push(song);
            return await othis.ShowQueue(message.channel, serverQueue, lang);
        }
    };

    ShowQueue = async function(channel, serverQueue, lang) {
        var othis = this;
        if (!serverQueue) {
            var emd = new this.Discord.MessageEmbed()
                .setTitle(othis.lng.Music.emptyQueue[lang])
                .setColor(0x0000FF);
            channel.send(emd);
            return;
        }
        let songs = serverQueue.songs;
        if (!songs) {
            var emd = new this.Discord.MessageEmbed()
                .setTitle(othis.lng.Music.queueEnded[lang])
                .setColor(0x0000FF);
            serverQueue.textChannel.send(emd);
            serverQueue.voiceChannel.leave();
            this.queue.delete(guild.id);
            return;
        }
        let queue = "";
        if (!(songs === [])) {
            let i = 0;
            while (i < (songs.length)) {
                if (i === 0) {
                    var dur = this.SecDHMS(songs[0].duration);
                    var cdur = this.SecDHMS((new Date() - songs[0].startedTS)/1000);
                    if(serverQueue.repeated){
                        queue = `${othis.lng.Music.currentTrack[lang]}: :repeat: _${songs[0].title}_ **${cdur}**/**${dur}**\n\n${othis.lng.Music.next[lang]}:`;
                    }else {
                        queue = `${othis.lng.Music.currentTrack[lang]}: _${songs[0].title}_ **${cdur}**/**${dur}**\n\n${othis.lng.Music.next[lang]}:`;
                    }
                } else {
                    var dur = this.SecDHMS(songs[i].duration);
                    queue = queue + "\n" + i.toString() + ". " + songs[i].title + " " + dur;
                }
                i++;
            }
        }
        var embed = new this.Discord.MessageEmbed();
        if (songs[0]) {
            embed
                .setTitle(`${othis.lng.Music.playingQueue[lang]}:`)
                .setColor(0x0000FF)
                .setDescription(queue)
                .setThumbnail(songs[0].thumbnail.url);
        } else {
            embed
                .setTitle(othis.lng.Music.emptyQueue[lang])
                .setColor(0x0000FF);
        }
        channel.send(embed);
    };

    Play = async function(guild, song, lang) {
        const serverQueue = this.queue.get(guild.id);
        var othis = this;
        if (!song) {
            if(serverQueue){
                var emd = new this.Discord.MessageEmbed()
                    .setTitle(othis.lng.Music.queueEnded[lang])
                    .setColor(0x0000FF);
                serverQueue.textChannel.send(emd);
                serverQueue.voiceChannel.leave();
                this.queue.delete(guild.id);
                return;
            }
        }
        song.startedTS =  new Date();
        await othis.ShowQueue(serverQueue.textChannel, serverQueue, lang);
        if(song.isRadio){
            var stream = new othis.PassThrough();
            await this.Request(song.url, { forever: true, rejectUnauthorized: false }).pipe(stream);
            serverQueue.connection.play(stream);
            serverQueue.connection.dispatcher.once('finish', async () => {
                if(!serverQueue.repeated){
                    serverQueue.songs.shift();
                }
                await othis.Play(guild, serverQueue.songs[0], lang);
            });
        }else {
            serverQueue.connection.play(othis.ytdl(song.url, { filter: 'audioonly' }));
            serverQueue.connection.dispatcher.once('finish', async () => {
                if(serverQueue.repeated){
                    await othis.Play(guild, serverQueue.songs[0], lang);
                    return;
                }else {
                    if(!serverQueue.repeated){
                        serverQueue.songs.shift();
                    }
                    await othis.Play(guild, serverQueue.songs[0], lang);
                }
            });
        }
    };
    Skip = async function(message, serverQueue, lang) {
        if (!message.member.voice.channel) return message.channel.send(this.lng.Music.niChannel[lang]);
        if (!serverQueue) return message.channel.send(this.lng.Music.noTrackSkip[lang]);
        if (!serverQueue.connection.dispatcher) {
            try {
                serverQueue.connection = await serverQueue.voiceChannel.join();
            } catch{
                serverQueue.voiceChannel.leave();
                this.queue.delete(serverQueue.textChannel.guild.id);
                return;
            }
        } else {
            serverQueue.connection.dispatcher.destroy();
        }
        serverQueue.songs.shift();
        await this.Play(message.guild, serverQueue.songs[0], lang);
        return;
    };

    Stop = async function(message, serverQueue, lang) {
        if (!message.member.voice.channel) return message.channel.send(this.lng.Music.niChannel[lang]);
        if (!serverQueue) return message.channel.send(this.lng.Music.queueAlyEmpty[lang]);
        if (!serverQueue.connection.dispatcher) {
            try {
                serverQueue.connection = await serverQueue.voiceChannel.join();
            } catch{
                serverQueue.voiceChannel.leave();
                this.queue.delete(serverQueue.textChannel.guild.id);
                return;
            }
        } else {
            serverQueue.connection.dispatcher.destroy();
        }
        serverQueue.songs = [];
        await this.Play(message.guild, serverQueue.songs[0], lang);
        return;
    };
    Repeat = async function(message, serverQueue, lang){
        if (!message.member.voice.channel) return message.channel.send(this.lng.Music.niChannel[lang]);
        if (!serverQueue) return message.channel.send(this.lng.Music.emptyQueue[lang]);
        serverQueue.repeated = !serverQueue.repeated;
        await this.ShowQueue(serverQueue.textChannel, serverQueue, lang);
        return;
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Music;
