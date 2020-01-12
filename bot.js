const dev_mode = false;


if (dev_mode === true) {
    token = "NjI3NDkyMTQyMjk3NjQ1MDU2.XhTDOw.7-rtuqO2kLSwCRvcv0ty4me9QtU"
} else {
    token = "NTcxOTQ4OTkzNjQzNTQ0NTg3.XgeiKw.cEkANo0lixhtWYJ1ILAOVHwUTlI"
}
const Eris = require("eris");
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const search = require('youtube-search');
const fs = require("fs");
const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('./database.db');
const DBL = require("dblapi.js");
const request = require("request");

const client = new Discord.Client();
const bot = new Eris(token);
const dbl = new DBL('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU3MTk0ODk5MzY0MzU0NDU4NyIsImJvdCI6dHJ1ZSwiaWF0IjoxNTc1NTczMjAyfQ.9OfSSDWcanClZpsqdFsz7U-1gStTb0SwYZWF49FtrNU', client);

var search_opts = {
    maxResults: 1,
    key: 'AIzaSyA7GWi6ML0kZepUMz4Oh8niBZvXguvasmQ',
};

var utime;
const queue = new Map();

client.once('ready', () => {
    console.log('Ready 1!');
    utime = new Date();
    client.user.setPresence({
        game: {
            name: `!rhelp`,
            type: 0,
        }
    })
    load_modules(getFiles("./cmds/"));
    getUserByDiscordID("508637328349331462", function (user) {
        console.log(user);
    });
});

bot.on('ready', () => {
    console.log('Ready 2!');
});

client.once('reconnecting', () => {
    console.log('Reconnecting!');
});

client.once('disconnect', () => {
    console.log('Disconnect!');
});



function messageStats() {
    fs.readFile('stats.json', 'utf8', function (error, data) {
        var file;
        if (!(data)) {
            file = {
                stats: {
                    messages: 1,
                }
            }
        } else {
            data = JSON.parse(data);
            file = {
                stats: {
                    messages: data.stats.messages + 1,
                }
            }
        }
        json = JSON.stringify(file, null, 4)
        fs.writeFile(`stats.json`, json, null, function () { })
    });
}

client.on('message', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith("!")) return;

    messageStats();
    const serverQueue = queue.get(message.guild.id);
    checkReg(message, function () {
        getUserByDiscordID(message.author.id, function (user) {

            checkBan(message, function () {
                checkVip(message, function () {
                    if (message.content.startsWith(`!rhelp`)) {
                        rhelp(message, Discord);
                        return;

                    } else if (message.content.startsWith(`!ukrmova`)) {
                        ukrmova(message, Discord);
                        return;

                    } else if (message.content.startsWith(`!upd`)) {
                        upd(message, Discord);
                        return;

                    } else if (message.content.startsWith(`!uptime`)) {
                        uptime(message, utime, Discord);
                        return;

                    } else if (message.content.startsWith(`!rstats`)) {
                        rstats(message, client, utime, Discord, fs, getDataBaseLength);
                        return;

                    } else if (message.content.startsWith(`!hentai`)) {
                        hentai(message, client, Discord, fs, db, getUserByDiscordID);
                        return;

                    } else if (message.content.startsWith(`!shop`)) {
                        shop(message, client, Discord, db, getUserByDiscordID);
                        return;

                    } else if (message.content.startsWith(`!buy`)) {
                        buy(message, Discord, db, client, getUserByDiscordID, updateUser);
                        return

                    } else if (message.content.startsWith(`!profile`)) {
                        profile(message, Discord, db, client, getUserByDiscordID, updateUser);
                        return

                    } else if (message.content.startsWith(`!getmoney`)) {
                        getmoney(message, Discord, db, client, getUserByDiscordID, updateUser);
                        return

                    } else if (message.content.startsWith(`!set`)) {
                        if (user.user_group === "Admin") {
                            sett(message, Discord, db, client, getUserByDiscordID, updateUser);
                            return;
                        } else {
                            message.channel.send("У вас нет прав администратора!");
                            return;
                        }

                    } else if (message.content.startsWith(`!ban`)) {
                        if (user.user_group === "Admin") {
                            ban(message, Discord, db, client, getUserByDiscordID, updateUser);
                            return;
                        } else {
                            message.channel.send("У вас нет прав администратора!");
                            return;
                        }

                    } else if (message.content.startsWith(`!freevip`)) {
                        freevip(message, Discord, db, client, getUserByDiscordID, updateUser, dbl);
                        return

                    } else if (message.content.startsWith(`!items`)) {
                        items(message, Discord, db, client, getUserByDiscordID, updateUser);
                        return

                    } else if (message.content.startsWith(`!play `)) {
                        execute(message, serverQueue);
                        return;

                    } else if (message.content.startsWith(`!playp`)) {
                        executep(message, serverQueue);
                        return;

                    } else if (message.content.startsWith(`!skip`)) {
                        skip(message, serverQueue);
                        return;

                    } else if (message.content.startsWith(`!stop`)) {
                        stop(message, serverQueue);
                        return;

                    } else if (message.content.startsWith(`!queue`)) {
                        show_queue(message.channel, serverQueue);
                        return;

                    } else if (message.content.startsWith(`!pay`)) {
                        pay(message, Discord, db, client, getUserByDiscordID, updateUser);
                        return

                    } else if (message.content.startsWith(`!roll`)) {
                        roll(message, Discord);
                        return;

                    } else if (message.content.startsWith(`!8ball`)) {
                        ball8(message, Discord);
                        return;

                    } else if (message.content.startsWith(`!randcat`)) {
                        randcat(message, Discord, request);
                        return;

                    } else {
                        console.log('You need to enter a valid command!')
                    }
                });
            });
        });
    });
});


function checkVip(message, done) {
    getUserByDiscordID(message.author.id, function (user) {
        if (user.user_group === "VIP") {
            var curTS = new Date().getTime() / 1000;
            var diff;
            if (user.vip_time === "inf") {
                done();
            } else {
                diff = user.vip_time - curTS;
            }
            if (diff <= 0) {
                user.vip_time = 0;
                user.user_group = "Player";
                updateUser(message.author.id, user, function () {
                    done();
                });
            } else {
                done();
            }
        } else {
            done();
        }
    });
}

function checkBan(message, done) {
    getUserByDiscordID(message.author.id, function (user) {
        if (user.user_group === "Banned") {
            var ban_time;
            var curTS = new Date().getTime() / 1000;
            var diff;
            if (user.ban_time === "inf") {
                ban_time = "никогда, лол)";
            } else {
                diff = user.ban_time - curTS;
                ban_time = timeConversion(diff * 1000);
            }
            if (diff <= 0) {
                user.ban_time = 0;
                user.user_group = "Player";
                updateUser(message.author.id, user, function () {
                    done();
                });
            } else {
                message.channel.send(`Вы забанены! Причина: ${user.ban_reason}, Бан истекает через: ${ban_time}`);
                return;
            }
        } else {
            done();
        }
    });
}

function checkReg(message, done) {
    getUserByDiscordID(message.author.id, function (user) {
        if (!(user)) {
            registerUser(message, function () { done() });
        } else {
            done();
        }
    });
}

function timeConversion(millisec) {
    var seconds = parseInt(millisec / 1000);
    var minutes = parseInt(millisec / (1000 * 60));
    var hours = parseInt(millisec / (1000 * 60 * 60));
    var days = parseInt(millisec / (1000 * 60 * 60 * 24));

    var stime;
    if (seconds < 60) {
        stime = `${seconds} секунд`;
    } else if (minutes < 60) {
        stime = `${minutes} минут, ${seconds - minutes * 60} секунд`;
    } else if (hours < 24) {
        stime = `${hours} часов, ${minutes - hours * 60} минут, ${seconds - minutes * 60} секунд`;
    } else {
        stime = `${days} дней, ${hours - days * 24} часов, ${minutes - hours * 60} минут, ${seconds - minutes * 60} секунд`;
    }
    return stime;
}


var getFiles = function (dir, files_) {

    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
};

function load_modules(modules) {
    i = 0
    while (i < modules.length) {
        eval.apply(global, [fs.readFileSync(modules[i]).toString()]);
        i++;
    }
}




//DATABASE FUNCTIONS
function getDataBaseLength(done) {
    db.all(`SELECT * FROM users_info`, [], (err, rows) => {
        if (err) {
            throw err;
        }
        var length = rows.length;
        done(length);
        return length;
    });
}

function registerUser(message, done) {
    getDataBaseLength(function (dbLength) {
        db.run(`INSERT INTO users_info VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [message.author.tag, 50000, "Player", 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, dbLength + 1, message.author.id, "True", 1], function (err) {
            if (err) {
                return console.log(err.message);
            }
            done();
        });
    });
}

function getUserByDiscordID(discordId, done) {
    db.all(`SELECT * FROM users_info WHERE discord_id = ${discordId}`, [], (err, rows) => {
        if (err) {
            throw err;
        }
        var user = rows[0];
        done(user);
        return user;
    });
}

function getUserByLocalID(localID, done) {
    db.all(`SELECT * FROM users_info WHERE num = ${localID}`, [], (err, rows) => {
        if (err) {
            throw err;
        }
        var user = rows[0];
        done(user);
        return user;
    });
}

function getUserByName(Name, done) {
    db.all(`SELECT * FROM users_info WHERE user = ${Name}`, [], (err, rows) => {
        if (err) {
            throw err;
        }
        var user = rows[0];
        done(user);
        return user;
    });
}

function updateUser(discord_id, newUser, done) {
    db.run(`UPDATE users_info SET user=?, user_points=?, user_group=?, user_lvl=?, user_xp=?, bitminer1=?, bitminer2=?, bitminer_rack=?, bitm_dc=?, solar_station=?, bm1_time=?, bm2_time=?, bmr_time=?, bitm_dc_time=?, ss_time=?, ban_reason=?, ban_time=?, vip_time=?, num=?, discord_id=?, news_sub=?, damage=? WHERE discord_id = ?`, [newUser.user, newUser.user_points, newUser.user_group, newUser.user_lvl, newUser.user_xp, newUser.bitminer1, newUser.bitminer2, newUser.bitminer_rack, newUser.bitm_dc, newUser.solar_station, newUser.bm1_time, 0, 0, 0, 0, newUser.ban_reason, newUser.ban_time, newUser.vip_time, newUser.num, newUser.discord_id, newUser.news_sub, newUser.damage, discord_id], function (err) {
        if (err) {
            return console.log(err.message);
        }
        done();
    });
}
































async function execute(message, serverQueue) {
    const sch_req = message.content.substr(6);

    const voiceChannel = message.member.voiceChannelID;
    var res = null;
    search(sch_req, search_opts, async function (err, res) {
        if (err) return console.log(err);
        console.log(res);
        const songInfo = await ytdl.getInfo(res[0].link);
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
                vc: message.member.voiceChannel,
                connection: null,
                songs: [],
                current: null,
                volume: 5,
                playing: true,
            };

            queue.set(message.guild.id, queueContruct);

            queueContruct.songs.push(song);

            try {
                bot.joinVoiceChannel(queueContruct.voiceChannel).catch((err) => { // Join the user's voice channel
                    bot.createMessage(message.channel.id, "Ошибка присоеднения к голосовому каналу: " + err.message); // Notify the user if there is an error
                    console.log(err); // Log the error
                }).then((connection) => {
                    queueContruct.connection = connection;
                    play(message.guild, queueContruct.songs[0]);
                });
            } catch (err) {
                console.log(err);
                queue.delete(message.guild.id);
                return message.channel.send(err);
            }
        } else {
            serverQueue.songs.push(song);
            return show_queue(message.channel, serverQueue)
        }
    });
}

async function executep(message, serverQueue) {
    var gavno = message.content.substr(7).split(";;");

    console.log(gavno);
    const voiceChannel = message.member.voiceChannelID;

    var res = null;
    search(gavno[0], search_opts, async function (err, res) {
        if (err) return console.log(err);
        console.log(res);
        const songInfo = await ytdl.getInfo(res[0].link);
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
                vc: message.member.voiceChannel,
                connection: null,
                songs: [],
                current: null,
                volume: 5,
                playing: true,
            };

            queue.set(message.guild.id, queueContruct);

            queueContruct.songs.push(song);
            i = 1;
            while (i < gavno.length) {
                search(gavno[i], search_opts, async function (err, res) {
                    if (err) return console.log(err);
                    console.log(res);
                    const songInfo = await ytdl.getInfo(res[0].link);
                    const song = {
                        title: songInfo.title,
                        url: songInfo.video_url,
                        duration: songInfo.length_seconds,
                        thumbnail: res[0].thumbnails.high,
                    };
                    queueContruct.songs.push(song);
                });
                i++;
            };

            try {
                bot.joinVoiceChannel(queueContruct.voiceChannel).catch((err) => { // Join the user's voice channel
                    bot.createMessage(message.channel.id, "Ошибка присоеднения к голосовому каналу: " + err.message); // Notify the user if there is an error
                    console.log(err); // Log the error
                }).then((connection) => {
                    queueContruct.connection = connection;
                    play(message.guild, queueContruct.songs[0]);
                });
            } catch (err) {
                console.log(err);
                queue.delete(message.guild.id);
                return message.channel.send(err);
            }
        } else {
            serverQueue.songs.push(song);
            console.log(serverQueue.songs);
            i = 1;
            while (i < gavno.length) {
                search(gavno[i], search_opts, async function (err, res) {
                    if (err) return console.log(err);
                    console.log(res);
                    const songInfo = await ytdl.getInfo(res[0].link);
                    const song = {
                        title: songInfo.title,
                        url: songInfo.video_url,
                        duration: songInfo.length_seconds,
                        thumbnail: res[0].thumbnails.high,
                    };
                    serverQueue.songs.push(song);
                });
                i++;
            };
            return show_queue(message.channel, serverQueue)
        }

    });
}



function show_queue(channel, serverQueue) {
    let songs = serverQueue.songs;
    if (!songs) {
        emd = new Discord.RichEmbed()
            .setTitle("Очередь окончена!")
            .setColor(0x0000FF);
        serverQueue.textChannel.send(emd);
        bot.leaveVoiceChannel(serverQueue.voiceChannel)
        queue.delete(guild.id);
        return;
    }
    let queue = "";
    if (!(songs === [])) {
        let i = 0;
        while (i < (songs.length)) {
            if (i === 0) {
                dur = secondsToDhms(songs[0].duration)
                queue = `Текущий трек: _${songs[0].title}_ **${dur}**\n\nСледующие:`;
            } else {
                dur = secondsToDhms(songs[i].duration)
                queue = queue + "\n" + i.toString() + ". " + songs[i].title + " " + dur;
            }
            i++;
        }
    }
    embed = new Discord.RichEmbed()
        .setTitle("Очередь воспроизведения:")
        .setColor(0x0000FF)
        .setDescription(queue);
    if (songs[0]) {
        embed.setThumbnail(songs[0].thumbnail.url);
    }
    channel.send(embed)
}

function secondsToDhms(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor(seconds % (3600 * 24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);

    return `**${d}:${h}:${m}:${s}**`;
}

function skip(message, serverQueue) {
    if (!message.member.voiceChannel) return message.channel.send('Вы должны находиться в голосовом канале!');
    if (!serverQueue) return message.channel.send('Нету трека, который можно пропустить!');
    serverQueue.connection.stopPlaying();
    return show_queue(message.channel, serverQueue);
}

function stop(message, serverQueue) {
    if (!message.member.voiceChannel) return message.channel.send('Вы должны находиться в голосовом канале!');
    serverQueue.songs = [];
    serverQueue.connection.stopPlaying();
    bot.leaveVoiceChannel(serverQueue.voiceChannel);
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        emd = new Discord.RichEmbed()
            .setTitle("Очередь окончена!")
            .setColor(0x0000FF);
        serverQueue.textChannel.send(emd);
        bot.leaveVoiceChannel(serverQueue.voiceChannel)
        queue.delete(guild.id);
        return;
    }
    show_queue(serverQueue.textChannel, serverQueue);
    serverQueue.connection.play(ytdl(song.url, { filter: 'audioonly' }));
    serverQueue.connection.once('end', () => {
        console.log('Music ended!');
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
    });
}








client.login(token);
bot.connect();
