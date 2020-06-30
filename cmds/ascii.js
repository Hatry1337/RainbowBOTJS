var moduleName = "Ascii";
function moduleOnLoad() {
    console.log(`Module "${this.name}" loaded!`)
}

class Ascii {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
        this.Utils = Utils;
    }
    fontExist = function (fnt) {
        var files_ = "";
        var files = this.Utils.FS.readdirSync(this.Utils.DirName + "\\fgfonts\\");
        var i = 0;
        for (i in files) {
             files_ += files[i].replace(".flf", "")+" ";
        }
        return (files_.indexOf(fnt + " ") !== -1);
    }
    sendFonts = function (channel, i) {
        var dir = this.Utils.DirName + "\\fgfonts\\";
        var files_ = "";
        var files = this.Utils.FS.readdirSync(dir);
        var mlng = files.sort(function (a, b) { return b.length - a.length; })[0].length;
        while (i < files.length) {
            if ((files_ + files[i].replace(".flf", "") + " ".repeat(mlng - files[i].length) + "\n").length >= 1900) {
                channel.send("```Available Fonts:\n" + files_ + "```");
                this.sendFonts(channel, i);
                return;
            }
            if (i % 6 === 0 && i !== 0) {
                files_ += files[i].replace(".flf", "") + " ".repeat(mlng - files[i].length+1) + "\n";
            } else {
                files_ += files[i].replace(".flf", "") + " ".repeat(mlng - files[i].length+1);
            }
            i++;
        }
        channel.send("```Available Fonts:\n" + files_ + "```");
        return;
    };
    execute = async function (message) {
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
                    var imgpath = this.Utils.DirName + "\\tempimg\\" + imgs[0].id + imgs[0].name;
                    var writeStream = this.Utils.FS.createWriteStream(imgpath);
                    await this.Utils.RequestPromise(imgs[0].proxyURL + "?width=130&height=120").pipe(writeStream);
                    var othis = this;
                    writeStream.on('finish', async () => {
                        if (inverted) {
                            const settings = {
                                white_cutoff: 0.36,
                                whitespace: [[0, 0], [0, 0], [0, 0], [0, 1]],
                            };
                            othis.Utils.Braile.image2braille(imgpath, settings).then(strimage => {
                                var out = '';
                                for (const line of strimage) {
                                    out += `${line.join('').trimRight()}\n`;
                                }
                                message.channel.send("```" + out + "```");
                            }).catch(err => {
                                console.log(`Cannot handle the request due to:\n${err}`);
                            });
                        } else {
                            await othis.Utils.Jimp.read(imgpath, async (err, img) => {
                                if (err) throw err;
                                img.invert();
                                imgpath += ".png";
                                img.write(imgpath);
                                const settings = {
                                    white_cutoff: 0.36,
                                    whitespace: [[0, 0], [0, 0], [0, 0], [0, 1]],
                                };
                                othis.Utils.Braile.image2braille(imgpath, settings).then(strimage => {
                                    var out = '';
                                    for (const line of strimage) {
                                        out += `${line.join('').trimRight()}\n`;
                                    }
                                    message.channel.send("```" + out + "```");
                                }).catch(err => {
                                    console.log(`Cannot handle the request due to:\n${err}`);
                                });
                            });
                        }
                    });
                } else {
                    message.channel.send("Error: No image specified");
                    return;
                }
            } else if (args[1] === "--fontlist") {
                this.sendFonts(message.channel, 0);
                return;
            }else {
                var text = message.content.slice(7);
                var font = text.indexOf("--font ");
                if (font !== -1) {
                    font = text.slice(font + 7);
                    text = text.replace("--font " + font, '');
                    if (!this.fontExist(font)) {
                        message.channel.send("Error: Unknown font '" + font + "'");
                        return;
                    }
                } else {
                    font = 'Doom';
                }
                var re = /а|б|в|г|д|е|ё|ж|з|и|ё|к|л|м|н|о|п|р|с|т|у|ф|х|ц|ч|ш|щ|ъ|ы|ь|э|ю|я/gi;
                if (re.test(text.toLowerCase())) {
                    message.channel.send("Error: only english letters available!");
                    return;
                }
                await this.Utils.AsciiFont.create(text, font, function (err, res) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    message.channel.send("```" + res + "```");
                    return;
                });
            }
        } else {
            message.channel.send("```Usage:\n!ascii <arg1> <arg2>\narg1 = text - ascii text art\narg1 = '--pic' - ascii picture art(add picture to the message)\narg1 = '--fontlist' - list of available fonts\n\narg2 = '--font <fontname>' - use selected font on your text```")
            return;
        }
    }
}



module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Ascii;