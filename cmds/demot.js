const RainbowBOT = require("../modules/RainbowBOT");
const Database = require("../modules/Database");
const Discord = require("discord.js");
const fs = require("fs");
const RequestPromise = require("request-promise");
const Jimp = require("jimp");
const Braile = require("braille-art");
const AsciiFont = require('ascii-art-font');
AsciiFont.fontPath = 'fgfonts/';

class Demot {
    /**
     * @param {RainbowBOT} rbot 
     */
    constructor(rbot){
        this.Name = "Demot";
        this.rbot = rbot;
        this.lng = rbot.localization;

        this.rbot.on('command', async (message) => {
            if (message.content.startsWith(`!demot`)) {
                await this.execute(message);
            }
        });

        console.log(`Module "${this.Name}" loaded!`)
    }


    /**
     * @param {Discord.Message} message Discord Message object
     * @returns {Promise<Discord.Message>}
     */
    execute(message) {
        /**
         * @type {Ascii}
         */
        return new Promise(async (resolve, reject) => {
            var args = message.content.split(" ");
            if (args[1]) {
                var header;
                var label;
                var hpos = message.content.indexOf("--header ");
                var lpos = message.content.indexOf("--label ");
                
                if(hpos !== -1){
                    var dhpos = message.content.indexOf(" --", hpos + 9);
                    if(dhpos !== -1){
                        header = message.content.slice(hpos + 9, dhpos);
                    }else{
                        header = message.content.slice(hpos + 9);
                    }
                }
                if(lpos !== -1){
                    var dlpos = message.content.indexOf(" --", lpos + 8);
                    if(dlpos !== -1){
                        label = message.content.slice(lpos + 8, dlpos);
                    }else{
                        label = message.content.slice(lpos + 8);
                    }
                }

                if(header || label){
                    var imgs = message.attachments.array();
                    if (imgs.length !== 0) {
                        var imgpath = process.env.dirname + "/tempimg/" + imgs[0].id + imgs[0].name;
                        var writeStream = fs.createWriteStream(imgpath);
                        await RequestPromise(imgs[0].proxyURL).pipe(writeStream);
                        writeStream.on('finish', async () => {
                            Jimp.read(process.env.dirname + "/demot_template.png", async (err, templ_img) => {
                                if (err) throw err;
                                Jimp.read(imgpath, async (err, internal_img) => {
                                    if (err) throw err;
                                    internal_img.resize(606, 455);
                                    templ_img.composite(internal_img, 76, 45);
                                    Jimp.loadFont(process.env.dirname + '/fonts/font-arial/arial.fnt').then(async f_arial => {
                                        Jimp.loadFont(process.env.dirname + '/fonts/font-times/times.fnt').then(async f_times => {
                                            if(header){
                                                templ_img.print(f_times, 110, 525, {
                                                    text: header,
                                                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                                                    alignmentY: Jimp.VERTICAL_ALIGN_TOP
                                                }, 530, 120);
                                            }

                                            if(label){
                                                templ_img.print(f_arial, 50, 600, {
                                                    text: label,
                                                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                                                    alignmentY: Jimp.VERTICAL_ALIGN_TOP
                                                }, 660, 120);
                                            }

                                            templ_img.write(process.env.dirname + "/tempimg/demotes/" + imgs[0].id + imgs[0].name);
                                            resolve(await message.channel.send({ files: [process.env.dirname + "/tempimg/demotes/" + imgs[0].id + imgs[0].name] }));
                                        });
                                    });
                                });
                            });
                            
                        });
                    }else{
                        resolve(await message.channel.send("Error: No image provided."));
                        return;
                    }

                }else{
                    resolve(await message.channel.send("Error: No header or label provided."));
                    return;
                }

            } else {
                resolve(await message.channel.send("```Usage:\n!demot --header <text> --label <text>```"));
                return;
            }
                /*if (args[1] === "--pic") {
                    
                        var text = message.content.slice(7);
                        var inverted = text.indexOf("--inverted");
                        if (inverted !== -1) {
                            inverted = true;
                        } else {
                            inverted = false;
                        }
                        
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
                                    if(raw){
                                        resolve(out);
                                    }else{
                                        resolve(message.channel.send("```" + out + "```"));
                                    }
                                    Database.writeLog('ascii', message.author.id, message.guild.name, {
                                        Message: `User '${message.author.tag}' drawed inverted image. Cached image path: '${imgpath}'.`
                                    });
                                }).catch(err => {
                                    console.log(`Cannot handle the request due to:\n${err}`);
                                });
                            } else {
                                
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
                                        if(raw){
                                            resolve(out);
                                        }else{
                                            resolve(message.channel.send("```" + out + "```"));
                                        }
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
                        
                    }
                } else if (args[1] === "--fontlist") {
                    if(raw){
                        resolve("Error: Can't send fonts list to pipe!");
                    }else{
                        resolve(await this.sendFonts(message.channel));
                    }
                    Database.writeLog('ascii', message.author.id, message.guild.name, {
                            Message: `User '${message.author.tag}' watched list of available ascii fonts.`
                    });
                    return;
                }else {
                    var text = message.content.slice(7);
                    var font = text.indexOf("--font ");
                    if (font !== -1) {
                        font = text.slice(font + 7);
                        text = text.replace("--font " + font, '');
                        if (!othis.fontExist(font)) {
                            if(raw){
                                resolve("Error: Unknown font '" + font + "'");
                            }else{
                                resolve(message.channel.send("Error: Unknown font '" + font + "'"));
                            }
                            return;
                        }
                    } else {
                        font = 'Doom';
                    }
                    var re = /а-я/gi;
                    if (re.test(text.toLowerCase())) {
                        if(raw){
                            resolve("Error: only english letters available!");
                        }else{
                            resolve(message.channel.send("Error: only english letters available!"));
                        }
                        return;
                    }
                    await AsciiFont.create(text, font, async (err, res) => {
                        if (err) reject(err)      
                        if(raw){
                            resolve(res);
                        }else{
                            res.replace(/`/g, "\\`");
                            resolve(message.channel.send("```" + res + "```"));
                        }
                        Database.writeLog('ascii', message.author.id, message.guild.name, {
                                Message: `User '${message.author.tag}' drawed text '${text}' with font '${font}'.`
                        });
                    });
                }
                */
            
        });
    }
}

module.exports = Demot;