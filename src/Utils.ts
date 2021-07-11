import Discord from "discord.js";
import RainbowBOT from "./RainbowBOT";
//const Database = require("./Database");
//import User from "./User";
import fs from "fs";

class Utils {
    rbot: RainbowBOT;
    lng: object;
    constructor(rbot: RainbowBOT) {
        /**
         * @type {RainbowBOT}
         */
        this.rbot = rbot;
        this.lng = rbot.localization;
    };

    itemTypes = {
        VideoCard: 1,
        Case: 2,
        Farm: 3
    };

    /**
     * @param {Discord.Message} message 
     * @param {User} user 
     */
    checkLang(message:Discord.Message, user) {
        if (user.lang === null) {
            message.channel.send(
                new Discord.MessageEmbed()
                    .setColor(0xFF0000)
                    .setTitle("Select your language/Выберите свой язык\n```!lang en - English Language (Английский Язык)\n!lang ru - Russian Language (Русский Язык)```")
            );
        }
    };

    /**
     * @param {Discord.Message} message 
     * @param {User} user 
     */
    langChange(message, user) {
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

    /**
     * @param {Discord.Message} message 
     * @param {User} user 
     * @returns {Promise<User>}
     */
    fetchLang(message, user){
        return new Promise(async (resolve, reject) => {
            if(user.lang === "ru" || user.lang === "en"){
                resolve(user);
            }else if(message.guild.region === "russia"){
                await user.setLang("ru");
                message.author.createDM().then(channel => {
                    channel.send(
                        new Discord.MessageEmbed()
                            .setColor(0xFF0000)
                            .setTitle("Selected Russian language, you can change them by command !lang\nУстановлен русский язык, Вы можете сменить его с помощью команды !lang")
                    );
                });
            }else {
                await user.setLang("en");
                message.author.createDM().then(channel => {
                    channel.send(
                        new Discord.MessageEmbed()
                            .setColor(0xFF0000)
                            .setTitle("Selected English language, you can change them by command !lang\nУстановлен английский язык, Вы можете сменить его с помощью команды !lang")
                    );
                });
            }
            resolve(user);
        });
    };

    /**
     * @param {Discord.Message} message 
     */
    saveMessage(message) {
        var toWrite =
            `sv[${message.channel.guild.name}]\n
            ch[${message.channel.name}]\n
            ${message.createdAt}\n
            ci[${message.channel.id}] ai[${message.author.id}] an[${message.author.tag}] mc[${message.content}]`;
        fs.appendFile("/var/www/html/msgs/index.txt", `\n${toWrite}\n`, function () { });
    };

    /**
     * @param {Discord.Message} message
     * @param {User} user  
     */
    updateUserName(message, user){
        if(message.author.tag !== user.tag){
            user.setTag(message.author.tag);
        }
    };

    /**
     * @param {Discord.Message} message
     * @param {User} user  
     * @returns {Promise<User>}
     */
    checkVip(message, user) {
        return new Promise(async (resolve, reject) => {
            if (user.group === "VIP") {
                var curTS = new Date().getTime() / 1000;
                if(user.meta.vip && user.meta.vip.endsAt){
                    if (user.meta.vip.endsAt - curTS <= 0) {
                        await user.setGroup("Player");
                    }
                }
            }
            resolve(user);
        });
    };

    /**
     * @param {Discord.Message} message
     * @param {User} user  
     * @returns {Promise<User>}
     */
    checkLvl(message, user){
        return new Promise(async (resolve, reject) => {
            if(user.xp !== 0 ){
                var lvls = Math.floor(user.xp / 1000);
                await user.setXp(user.xp - (lvls*1000));
                await user.setLvl(user.lvl += lvls);
                resolve(user);
            }else {
                resolve(user);
            }
        });
    };

    /**
     * @param {Discord.Message} message
     * @param {User} user  
     * @returns {Promise<User>}
     */
    checkBan(message, user) {
        return new Promise(async (resolve, reject) => {
            if (user.group === "Banned") {
                var curTS = new Date().getTime() / 1000;
                var diff = user.meta.ban.unbannedAt - curTS;
                var ban_time = this.timeConversion(diff * 1000, "ru");
                
                if (diff <= 0) {
                    await user.unban("Banned time is over.", "System");
                    resolve(user);
                } else {
                    message.channel.send(`Вы забанены! Причина: ${user.meta.ban.reason}, Бан истекает через: ${ban_time}`);
                    resolve(null);
                }
            } else {
                resolve(user);
            }
        });
    };

    /**
     * @param {Discord.Message} message
     * @returns {Promise<User>}
     */
    checkReg(message) {
        return new Promise(async (resolve, reject) => {
            var user = await Database.getUser(message.author.id, this.rbot);
            if (!user) {
                user = await Database.registerUser(message, this.rbot);
                Database.writeLog('Register', message.author.id, message.guild.name, {
                    Author: message.author.tag,
                    MContent: message.content,
                    SVID: message.guild.id,
                    CHName: message.channel.name,
                    Message: `User '${message.author.tag}' has been registered.`
                });
            }
            resolve(user);
        });
    };


    /**
     * @param {number} ms
     * @param {string} l Language to convert ("ru" || "en")
     * @returns {string}
     */
    timeConversion(ms, l) {
        if(!l){
            l = "en";
        }
        var seconds = parseInt(ms / 1000);
        var minutes = parseInt(ms / (1000 * 60));
        var hours =   parseInt(ms / (1000 * 60 * 60));
        var days =    parseInt(ms / (1000 * 60 * 60 * 24));
        var years =   parseInt(ms / (1000 * 60 * 60 * 24 * 365));
        var stime;
        if (seconds < 60) {
            stime = `${seconds} ${this.lng.sec[l]}`;
        } else if (minutes < 60) {
            stime = `${minutes} ${this.lng.min[l]}, ${seconds - minutes * 60} ${this.lng.sec[l]}`;
        } else if (hours < 24) {
            stime = `${hours} ${this.lng.hur[l]}, ${minutes - hours * 60} ${this.lng.min[l]}, ${seconds - minutes * 60} ${this.lng.sec[l]}`;
        } else if (days < 365){
            stime = `${days} ${this.lng.day[l]}, ${hours - days * 24} ${this.lng.hur[l]}, ${minutes - hours * 60} ${this.lng.min[l]}, ${seconds - minutes * 60} ${this.lng.sec[l]}`;
        }else{
            stime = `${years} ${this.lng.year[l]}, ${days - years * 365} ${this.lng.day[l]}, ${hours - days * 24} ${this.lng.hur[l]}, ${minutes - hours * 60} ${this.lng.min[l]}, ${seconds - minutes * 60} ${this.lng.sec[l]}`;
        }
        return stime;
    };

    /**
     * @param {number} seconds 
     * @returns {string}
     */
    secondsToDhms(seconds) {
        seconds = Number(seconds);
        var d = Math.floor(seconds / (3600 * 24));
        var h = Math.floor(seconds % (3600 * 24) / 3600);
        var m = Math.floor(seconds % 3600 / 60);
        var s = Math.floor(seconds % 60);
        return `${d}:${h}:${m}:${s}`;
    };

    /**
     * @param {string} dir 
     * @param {string[]} files_ 
     * @returns {string[]}
     */
    getFiles(dir, files_) {

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

    /**
     * @param {number} max 
     * @returns {number}
     */
    getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    };

    /**
     * @param {Array<any>} arr 
     */
    arrayRandElement(arr) {
        var rand = Math.floor(Math.random() * arr.length);
        return arr[rand];
    };

    clearImageCache() {
        var files = fs.readdirSync(process.env.dirname + "/tempimg/");
        for (var f of files) {
            fs.unlinkSync(process.env.dirname + "/tempimg/" + f);
        }

        files = fs.readdirSync(process.env.dirname + "/demotes/");
        for (var f of files) {
            fs.unlinkSync(process.env.dirname + "/tempimg/demotes" + f);
        }
    };

    /**
     * @returns {string}
     */
    parseID(raw_data) {
        raw_data = raw_data.toString();
        if (raw_data.startsWith("<<@")) {
            return raw_data.split(">")[1];
        } else if (raw_data.startsWith("<@!")) {
            raw_data = raw_data.replace("<@!", "");
            raw_data = raw_data.replace(">", "");
            return raw_data;
        } else if (raw_data.startsWith("<@&")) {
            raw_data = raw_data.replace("<@&", "");
            raw_data = raw_data.replace(">", "");
            return raw_data;
        }else if (raw_data.startsWith("<@")) {
            raw_data = raw_data.replace("<@", "");
            raw_data = raw_data.replace(">", "");
            return raw_data;
        }else if (raw_data.startsWith("<#")) {
            raw_data = raw_data.replace("<#", "");
            raw_data = raw_data.replace(">", "");
            return raw_data;
        } else {
            return raw_data;
        }
    };
    /**
     * 
     * @param {string} text Text from param being exracted
     * @param {string} param Param name in text
     * @returns {string} Data after --\<param\> to end of text or to next dash-param
     * 
     */
    extractDashParam(text, param){
        var data;
        var p_pos = text.indexOf(`--${param} `);
        
        if(p_pos !== -1){
            var dhpos = text.indexOf(" --", p_pos + param.length + 3);
            if(dhpos !== -1){
                data = text.slice(p_pos + param.length + 3, dhpos);
            }else{
                data = text.slice(p_pos + param.length + 3);
            }
        }
        
        return data;
    }
}

module.exports = Utils;