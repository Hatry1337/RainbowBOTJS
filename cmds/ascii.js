﻿const RainbowBOT = require("../modules/RainbowBOT");
const Database = require("../modules/Database");
const Discord = require("discord.js");
const fs = require("fs");
const RequestPromise = require("request-promise");
const Jimp = require("jimp");
const Braile = require("braille-art");
const AsciiFont = require('ascii-art-font');
AsciiFont.fontPath = 'fgfonts/';

class Ascii {
    /**
     * @param {RainbowBOT} rbot 
     */
    constructor(rbot){
        this.Name = "Ascii";
        this.rbot = rbot;
        this.lng = rbot.localization;

        this.rbot.on('command', async (message) => {
            if (message.content.startsWith(`!ascii`)) {
                await this.execute(message);
            }
        });

        console.log(`Module "${this.Name}" loaded!`)
    }

    /**
     * @param {string} fnt
     * @returns {boolean}
     */
    fontExist(fnt) {
        var files_ = "";
        var files = fs.readdirSync(process.env.dirname + "/fgfonts/");
        var i = 0;
        for (i in files) {
             files_ += files[i].replace(".flf", "")+" ";
        }
        return (files_.indexOf(fnt + " ") !== -1);
    };

     /**
     * @param {Discord.Channel} channel Discord Channel object
     * @returns {Promise<Discord.Message>}
     */
    async sendFonts(channel) {
        var files_ = "";
        var files = fs.readdirSync(process.env.dirname + "/fgfonts");
        var mlng = files.sort(function (a, b) { return b.length - a.length; })[0].length;
        for(var i in files){
            if (i % 6 === 0 && i !== 0) {
                files_ += files[i].replace(".flf", "") + " ".repeat(mlng - files[i].length+1) + "\n";
            } else {
                files_ += files[i].replace(".flf", "") + " ".repeat(mlng - files[i].length+1);
            }
            if ((files_ + files[i].replace(".flf", "") + " ".repeat(mlng - files[i].length) + "\n").length >= 1900) {
                await channel.send("```Available Fonts:\n" + files_ + "```");
                files_ = "";
            }
        }
        await channel.send("```Available Fonts:\n" + files_ + "```");
    };

        /**
     * @param {Discord.Message} message Discord Message object
     * @param {Function} pipef Pipe callback function for !pipe command
     * @param {string} pipet
     * @returns {Promise<Discord.Message>}
     */
    execute(message, pipef, pipet) {
        /**
         * @type {Ascii}
         */
        var othis = this;
        return new Promise(async (resolve, reject) => {
            var args = message.content.split(" ");
            if (args[1]) {
                if (args[1] === "--pic") {
                    var imgs = message.attachments.array();
                    if (imgs.length !== 0) {
                        var text = message.content.slice(7);
                        var inverted = text.indexOf("--inverted");
                        if (inverted !== -1) {
                            inverted = true;
                        } else {
                            inverted = false;
                        }
                        var imgpath = process.env.dirname + "/tempimg/" + imgs[0].id + imgs[0].name;
                        var writeStream = fs.createWriteStream(imgpath);
                        await RequestPromise(imgs[0].proxyURL + "?width=130&height=120").pipe(writeStream);
                        writeStream.on('finish', async () => {
                            if (inverted) {
                                const settings = {
                                    white_cutoff: 0.36,
                                    whitespace: [[0, 0], [0, 0], [0, 0], [0, 1]],
                                };
                                Braile.image2braille(imgpath, settings).then(strimage => {
                                    var out = '';
                                    for (const line of strimage) {
                                        out += `${line.join('').trimRight()}\n`;
                                    }
                                    resolve(message.channel.send("```" + out + "```"));
                                    Database.writeLog('ascii', message.author.id, message.guild.name, {
                                        Message: `User '${message.author.tag}' drawed inverted image. Cached image path: '${imgpath}'.`
                                    });
                                }).catch(err => {
                                    console.log(`Cannot handle the request due to:\n${err}`);
                                });
                            } else {
                                await Jimp.read(imgpath, async (err, img) => {
                                    if (err) throw err;
                                    img.invert();
                                    imgpath += ".png";
                                    img.write(imgpath);
                                    const settings = {
                                        white_cutoff: 0.36,
                                        whitespace: [[0, 0], [0, 0], [0, 0], [0, 1]],
                                    };
                                    Braile.image2braille(imgpath, settings).then(strimage => {
                                        var out = '';
                                        for (const line of strimage) {
                                            out += `${line.join('').trimRight()}\n`;
                                        }
                                        resolve(message.channel.send("```" + out + "```"));
                                        Database.writeLog('ascii', message.author.id, message.guild.name, {
                                            Message: `User '${message.author.tag}' drawed image. Cached image path: '${imgpath}'.`
                                        });
                                    }).catch(err => {
                                        console.log(`Cannot handle the request due to:\n${err}`);
                                    });
                                });
                            }
                        });
                    } else {
                        resolve(message.channel.send("Error: No image specified"));
                    }
                } else if (args[1] === "--fontlist") {
                    resolve(await this.sendFonts(message.channel));
                    Database.writeLog('ascii', message.author.id, message.guild.name, {
                            Message: `User '${message.author.tag}' watched list of available ascii fonts.`
                    });
                }else {
                    var text = message.content.slice(7);
                    var font = text.indexOf("--font ");
                    if (font !== -1) {
                        font = text.slice(font + 7);
                        text = text.replace("--font " + font, '');
                        if (!othis.fontExist(font)) {
                            resolve(message.channel.send("Error: Unknown font '" + font + "'"));
                        }
                    } else {
                        font = 'Doom';
                    }
                    var re = /а-я/gi;
                    if (re.test(text.toLowerCase())) {
                        resolve(message.channel.send("Error: only english letters available!"));
                    }
                    if(pipet){
                        text = pipet;
                    }
                    await AsciiFont.create(text, font, async (err, res) => {
                        if (err) reject(err)      
                        if (pipef){
                            resolve(await pipef(res));
                        }else {
                            res.replace(/`/g, "\\`");
                            resolve(message.channel.send("```" + res + "```"));
                        }
                        Database.writeLog('ascii', message.author.id, message.guild.name, {
                                Message: `User '${message.author.tag}' drawed text '${text}' with font '${font}'.`
                        });
                    });
                }
            } else {
                if(pipef){
                    resolve(await pipef("Usage:\n!ascii <arg1> <arg2>\narg1 = text - ascii text art\narg1 = '--pic' - ascii picture art(add picture to the message)\narg1 = '--fontlist' - list of available fonts\n\narg2 = '--font <fontname>' - use selected font on your text"));
                }else {
                    resolve(message.channel.send("```Usage:\n!ascii <arg1> <arg2>\narg1 = text - ascii text art\narg1 = '--pic' - ascii picture art(add picture to the message)\narg1 = '--fontlist' - list of available fonts\n\narg2 = '--font <fontname>' - use selected font on your text```"));
                }
                return;
            }
        });
    }
}

module.exports = Ascii;