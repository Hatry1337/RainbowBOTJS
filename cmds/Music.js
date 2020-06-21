var moduleName = "Music";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class Music {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
        this.SecDHMS = Utils.secondsToDhms;
        this.Request = Utils.RequestPromise;
        this.SearchOpts = {
            maxResults: 1,
            key: 'AIzaSyB99VVQZPIzMlPWlovUEDwkTHuOzlCNkkw',
        };
        this.ytdl = require('ytdl-core');
        this.YTSearch = require('youtube-search');
        this.PassThrough = require('stream').PassThrough;
        this.queue = new Map();
        this.lng = Utils.lng;
    }
    executePlay = async function (message, serverQueue, lang) {
        const sch_req = message.content.substr(6);
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel){
            message.channel.send(this.lng.Music.niChannel[lang]);
            return;
        }
        var res = null;
        var othis = this;
        this.YTSearch(sch_req, this.SearchOpts, async function (err, res) {
            if (err) return console.log(err);
            const songInfo = await othis.ytdl.getInfo(res[0].link);
            const song = {
                title: songInfo.title,
                url: songInfo.video_url,
                duration: songInfo.length_seconds,
                thumbnail: res[0].thumbnails.high,
                startedTS: new Date(),
            };
            if (!serverQueue) {
                const queueContruct = {
                    textChannel: message.channel,
                    voiceChannel: voiceChannel,
                    connection: null,
                    songs: [],
                    current: null,
                    volume: 5,
                    playing: true,
                };
                othis.queue.set(message.guild.id, queueContruct);
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
                return await othis.ShowQueue(message.channel, serverQueue, lang)
            }

        });
    };

    executePlayList = async function(message, serverQueue, lang) {
        var gavno = message.content.substr(7).split(";;");
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel){
            message.channel.send(this.lng.Music.niChannel[lang]);
            return;
        }
        var res = null;
        var othis = this;
        this.YTSearch(gavno[0], this.SearchOpts, async function (err, res) {
            if (err) return console.log(err);
            const songInfo = await othis.ytdl.getInfo(res[0].link);
            const song = {
                title: songInfo.title,
                url: songInfo.video_url,
                duration: songInfo.length_seconds,
                thumbnail: res[0].thumbnails.high,
            };
            if (!serverQueue) {
                const queueContruct = {
                    textChannel: message.channel,
                    voiceChannel: voiceChannel,
                    connection: null,
                    songs: [],
                    current: null,
                    volume: 5,
                    playing: true,
                };
                othis.queue.set(message.guild.id, queueContruct);
                queueContruct.songs.push(song);
                i = 1;
                while (i < gavno.length) {
                    othis.YTSearch(gavno[i], othis.SearchOpts, async function (err, res) {
                        if (err) return console.log(err);
                        const songInfo = await othis.ytdl.getInfo(res[0].link);
                        const song = {
                            title: songInfo.title,
                            url: songInfo.video_url,
                            duration: songInfo.length_seconds,
                            thumbnail: res[0].thumbnails.high,
                        };
                        queueContruct.songs.push(song);
                    });
                    i++;
                }
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
                var i = 1;
                while (i < gavno.length) {
                    othis.YTSearch(gavno[i], othis.SearchOpts, async function (err, res) {
                        if (err) return console.log(err);
                        const songInfo = await othis.ytdl.getInfo(res[0].link);
                        const song = {
                            title: songInfo.title,
                            url: songInfo.video_url,
                            duration: songInfo.length_seconds,
                            thumbnail: res[0].thumbnails.high,
                        };
                        serverQueue.songs.push(song);
                    });
                    i++;
                }
                return await othis.ShowQueue(message.channel, serverQueue);
            }
        });
    };

    executeRadio = async function(message, serverQueue, lang) {
        var voiceChannel = message.member.voice.channel;
        if(!voiceChannel){
            message.channel.send(this.lng.Music.niChannel[lang]);
            return;
        }
        var song = {
            isRadio: true,
            title: "RainbowFM",
            url: "https://air.rainbowbot.xyz",
            duration: 36000,
            thumbnail: {
                url: "https://media.discordapp.net/attachments/612222713716801537/722382264427610154/rbfm200.png",
                width: 200,
                height: 200,
            },
            startedTS: new Date(),
        };
        var othis = this;
        if (!serverQueue) {
            const queueContruct = {
                textChannel: message.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                current: null,
                volume: 5,
                playing: true,
            };
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
                    queue = `${othis.lng.Music.currentTrack[lang]}: _${songs[0].title}_ **${cdur}**/**${dur}**\n\n${othis.lng.Music.next[lang]}:`;
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
        await this.ShowQueue(serverQueue.textChannel, serverQueue, lang);
        var othis = this;
        if(song.isRadio){
            var stream = new othis.PassThrough();
            await this.Request(song.url, { forever: true }).pipe(stream);
            serverQueue.connection.play(stream);
            serverQueue.connection.dispatcher.once('finish', async () => {
                serverQueue.songs.shift();
                await othis.Play(guild, serverQueue.songs[0], lang);
            });
        }else {
            serverQueue.connection.play(othis.ytdl(song.url, { filter: 'audioonly' }));
            serverQueue.connection.dispatcher.once('finish', async () => {
                serverQueue.songs.shift();
                await othis.Play(guild, serverQueue.songs[0], lang);
            });
        }
    };
    Skip = async function(message, serverQueue, lang) {
        if (!message.member.voice.channel) return message.channel.send(this.lng.Music.niChannel[lang]);
        if (!serverQueue) return message.channel.send(this.lng.Music.noTrackSkip[lang]);
        serverQueue.connection.dispatcher.destroy();
        serverQueue.songs.shift();
        await this.Play(message.guild, serverQueue.songs[0], lang);
        return;
    };

    Stop = async function(message, serverQueue, lang) {
        if (!message.member.voice.channel) return message.channel.send(this.lng.Music.niChannel[lang]);
        if (!serverQueue) return message.channel.send(this.lng.Music.queueAlyEmpty[lang]);
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.destroy();
        await this.Play(message.guild, serverQueue.songs[0], lang);
        return;
    };
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Music;
