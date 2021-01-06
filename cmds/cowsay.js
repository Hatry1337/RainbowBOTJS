const RainbowBOT = require("../modules/RainbowBOT");
const Database = require("../modules/Database");
const Discord = require("discord.js");
const User = require("../modules/User");
const cowsay = require("cowsay");

class CowSay {
    /**
     * @param {RainbowBOT} rbot 
     */
    constructor(rbot){
        this.Name = "CowSay";
        this.rbot = rbot;
        this.lng = rbot.localization;

        this.rbot.on('command', async (message, user) => {
            if (message.content.startsWith(`!cowsay`)) {
                await this.execute(message, user);
            }
        });

        console.log(`Module "${this.Name}" loaded!`)
    }

    /**
     * 
     * @param {Discord.Message} message Discord Message object
     * @param {User} user RainbowBOT User object
     * @param {boolean} raw If true, not sends message to channel, resolves string
     * @returns {Promise<Discord.Message>}
     */
    execute(message, user, raw=false) {
        return new Promise(async (resolve, reject) => {
            var args = message.content.split(" ");
            var text = message.content.slice(8);
            if(text.indexOf("--cowlist") !== -1){
                cowsay.list((err, cows) => {
                    if(raw){
                        resolve(cows.join(", "));
                    }else{
                        resolve(message.channel.send("```"+cows.join(", ")+"```"));
                    }
                });
            }else if (!args[1]) {
                if(raw){
                    resolve(cowsay.say({text : "You didn't enter the text!"}));
                }else{
                    resolve(message.channel.send("```"+cowsay.say({text : "You didn't enter the text!"})+"```"));
                }
                Database.writeLog('cowsay', message.author.id, message.guild.name, {
                    Message: `User '${message.author.tag}' drawed empty cow.`
                });
            }else{
                var isThinking = false;
                if(text.indexOf("--thinking") !== -1){
                    isThinking = true;
                    text = text.replace(" --thinking", '');
                }
                var cowType = "default";
                if(text.indexOf("--cow ") !== -1){
                    cowType = text.slice(text.indexOf("--cow ") + 6);
                    text = text.replace(" --cow " + cowType, '');
                }
                cowsay.list((err, cows) => {
                    if(cows.indexOf(cowType) !== -1){
                        var res;
                        if(isThinking){
                            res = cowsay.think({text : text, f: cowType});
                        }else{
                            res = cowsay.say({text : text, f: cowType});
                        }
                        if(raw){
                            resolve(res);
                        }else{
                            res.replace(/`/g, "\\`");
                            resolve(message.channel.send("```"+res+"```"));
                        }
                        Database.writeLog('cowsay', message.author.id, message.guild.name, {
                            Message: `User '${message.author.tag}' drawed thinking cow with text '${text}'.`
                        });
                    }else{
                        if(raw){
                            resolve(cowsay.say({text : `Cow '${cowType}' does not exist.`}));
                        }else{
                            res.replace(/`/g, "\\`");
                            resolve(message.channel.send("```"+cowsay.say({text : `Cow '${cowType}' does not exist.`})+"```"));
                        }
                    }
                });
            }
        });
    }

    /**
     * 
     * @param {Discord.Message} message Discord Message object
     * @param {User} user RainbowBOT User object
     * @returns {Promise<Discord.Message>}
     */
    exec_pipe_in(message, user, ptext) {
        return new Promise(async (resolve, reject) => {
            var args = message.content.split(" ");
            var text = message.content.slice(8);
            if(text.indexOf("--cowlist") !== -1){
                cowsay.list((err, cows) => {
                    resolve(message.channel.send("```"+cows.join(", ")+"```"));
                });
            }else if (!args[1]) {
                resolve(message.channel.send("```"+cowsay.say({text : "You didn't enter the text!"})+"```"));
                Database.writeLog('cowsay', message.author.id, message.guild.name, {
                    Message: `User '${message.author.tag}' drawed empty cow.`
                });
            }else{
                var isThinking = false;
                if(text.indexOf("--thinking") !== -1){
                    isThinking = true;
                    text = text.replace(" --thinking", '');
                }
                var cowType = "default";
                if(text.indexOf("--cow ") !== -1){
                    cowType = text.slice(text.indexOf("--cow ") + 6);
                    text = text.replace(" --cow " + cowType, '');
                }
                cowsay.list((err, cows) => {
                    if(cows.indexOf(cowType) !== -1){
                        var res;
                        if(isThinking){
                            res = cowsay.think({text : ptext, f: cowType});
                        }else{
                            res = cowsay.say({text : ptext, f: cowType});
                        }
                        res.replace(/`/g, "\\`");
                        resolve(message.channel.send("```"+res+"```"));
                        Database.writeLog('cowsay', message.author.id, message.guild.name, {
                            Message: `User '${message.author.tag}' drawed thinking cow with text '${ptext}'.`
                        });
                    }else{
                        resolve(message.channel.send("```"+cowsay.say({text : `Cow '${cowType}' does not exist.`})+"```"));
                    }
                });
            }
        });
    }
}

module.exports = CowSay;
