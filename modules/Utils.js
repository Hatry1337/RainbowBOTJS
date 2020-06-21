class Utils {
    constructor(Discord, Database, Client, Fs, DirName) {
        this.Database = Database;
        this.Discord = Discord;
        this.Client = Client;
        this.FS = Fs;
        this.Modules = {};
        this.DBL = require("dblapi.js");
        this.dbl = new this.DBL('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU3MTk0ODk5MzY0MzU0NDU4NyIsImJvdCI6dHJ1ZSwiaWF0IjoxNTc1NTczMjAyfQ.9OfSSDWcanClZpsqdFsz7U-1gStTb0SwYZWF49FtrNU', this.Client);
        this.DirName = DirName;
        this.lng = require(this.DirName+"/lang").lng;
        this.Jimp = require("jimp");
        this.Request = require("request");
        this.RequestPromise = require("request-promise");
    };
    msgStat = function () {
        var othis = this;
        this.FS.readFile('stats.json', 'utf8', function (error, data) {
            if(error){
                throw error;
            }
            var file;
            if (!data) {
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
            var json = JSON.stringify(file, null, 4);
            othis.FS.writeFile(`stats.json`, json, null, function () { });
        });
    };
    checkLang = function(message, user) {
        if (user.lang == null) {
            return message.channel.send(
                new this.Discord.MessageEmbed()
                    .setColor(0xFF0000)
                    .setTitle("Select your language/Выберите свой язык\n```!lang en - English Language (Английский Язык)\n!lang ru - Russian Language (Русский Язык)```")
            );
        }
    };
    langChange = function(message, user) {
        var args = message.content.split(" ");
        if (args[1] === "en") {
            user.lang = "en";
            this.Database.updateUser(message.author.id, user, function () {
                return message.channel.send("You selected English language!");
            });
        } else if (args[1] === "ru") {
            user.lang = "ru";
            this.Database.updateUser(message.author.id, user, function () {
                return message.channel.send("Вы выбрали русский язык!");
            });
        } else {
            return message.channel.send(
                new this.Discord.MessageEmbed()
                    .setColor(0xFF0000)
                    .setTitle("Unknown Language, select one of this/Неизвестный язык, выберите из языков ниже\n```!lang en - English Language (Английский Язык)\n!lang ru - Russian Language (Русский Язык)```")
            );
        }
    };
    saveMessage = function(message) {
        var toWrite =
            `sv[${message.channel.guild.name}]\n
            ch[${message.channel.name}]\n
            ${message.createdAt}\n
            ci[${message.channel.id}] ai[${message.author.id}] an[${message.author.tag}] mc[${message.content}]`;
        this.FS.appendFile("/var/www/html/msgs/index.txt", `\n${toWrite}\n`, function () { });
    };
    checkVip = function(message, done) {
        var othis = this;
        this.Database.getUserByDiscordID(message.author.id, function (user) {
            if (user.user_group === "VIP") {
                var curTS = new Date().getTime() / 1000;
                var diff;
                if (user.vip_time === "inf") {
                    done();
                    return;
                } else {
                    diff = user.vip_time - curTS;
                }
                if (diff <= 0) {
                    user.vip_time = 0;
                    user.user_group = "Player";
                    othis.Database.updateUser(message.author.id, user, function () {
                        done();
                        return;
                    });
                } else {
                    done();
                    return;
                }
            } else {
                done();
                return;
            }
        });
    };
    checkBan = function(message, done) {
        var othis = this;
        this.Database.getUserByDiscordID(message.author.id, function (user) {
            if (user.user_group === "Banned") {
                var ban_time;
                var curTS = new Date().getTime() / 1000;
                var diff;
                if (user.ban_time === "inf") {
                    ban_time = "никогда, лол)";
                } else {
                    diff = user.ban_time - curTS;
                    ban_time = othis.timeConversion(diff * 1000);
                }
                if (diff <= 0) {
                    user.ban_time = 0;
                    user.user_group = "Player";
                    othis.Database.updateUser(message.author.id, user, function () {
                        done();
                        return;
                    });
                } else {
                    return message.channel.send(`Вы забанены! Причина: ${user.ban_reason}, Бан истекает через: ${ban_time}`);
                }
            } else {
                done();
                return;
            }
        });
    };
    checkReg = function(message, done) {
        var othis = this;
        this.Database.getUserByDiscordID(message.author.id, function (user) {
            if (!user) {
                othis.Database.registerUser(message, function () { done() });
            } else {
                done();
                return;
            }
        });
    };
    timeConversion = function(ms, l) {
        if(!l){
            l = "en";
        }
        var seconds = parseInt(ms / 1000);
        var minutes = parseInt(ms / (1000 * 60));
        var hours = parseInt(ms / (1000 * 60 * 60));
        var days = parseInt(ms / (1000 * 60 * 60 * 24));
        var stime;
        if (seconds < 60) {
            stime = `${seconds} ${this.lng.sec[l]}`;
        } else if (minutes < 60) {
            stime = `${minutes} ${this.lng.min[l]}, ${seconds - minutes * 60} ${this.lng.sec[l]}`;
        } else if (hours < 24) {
            stime = `${hours} ${this.lng.hur[l]}, ${minutes - hours * 60} ${this.lng.min[l]}, ${seconds - minutes * 60} ${this.lng.sec[l]}`;
        } else {
            stime = `${days} ${this.lng.day[l]}, ${hours - days * 24} ${this.lng.hur[l]}, ${minutes - hours * 60} ${this.lng.min[l]}, ${seconds - minutes * 60} ${this.lng.sec[l]}`;
        }
        return stime;
    };
    secondsToDhms = function(seconds) {
        seconds = Number(seconds);
        var d = Math.floor(seconds / (3600 * 24));
        var h = Math.floor(seconds % (3600 * 24) / 3600);
        var m = Math.floor(seconds % 3600 / 60);
        var s = Math.floor(seconds % 60);
        return `**${d}:${h}:${m}:${s}**`;
    };
    getFiles = function (dir, files_) {

        files_ = files_ || [];
        var files = this.FS.readdirSync(dir);
        for (var i in files) {
            var name = dir + '/' + files[i];
            if (this.FS.statSync(name).isDirectory()) {
                getFiles(name, files_);
            } else {
                files_.push(name);
            }
        }
        return files_;
    };
    loadModules = function(modules) {
        var othis = this;
        modules.forEach(function(item, i, arr) {
            item = item.substring(0, item.length - 3);
            var mod = require(item);
            othis.Modules[mod.info.name] = new mod.class(othis.Discord, othis.Database, othis.Client, othis.FS, othis);
            mod.info.onLoad();
        });
    };
    getRandomInt = function(max) {
        return Math.floor(Math.random() * Math.floor(max));
    };
    arrayRandElement = function(arr) {
        var rand = Math.floor(Math.random() * arr.length);
        return arr[rand];
    }
}

module.exports.Utils = Utils;