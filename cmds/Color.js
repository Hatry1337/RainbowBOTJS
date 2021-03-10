const Jimp = require("jimp");
const Discord = require("discord.js");

var moduleName = "Color";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class Color {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Database = Database;
        this.lng = Utils.lng;
        this.Utils = Utils;
    }

    execute = async function (message) {
        var args = message.content.split(" ");
        if (!args[1]) {
            return message.channel.send("No color specified (example: #FF00FF)");
        }
        var rg = /#[aA-zZ 0-9][aA-zZ 0-9][aA-zZ 0-9][aA-zZ 0-9][aA-zZ 0-9][aA-zZ 0-9]/;
        if(!rg.test(args[1])){
            return message.channel.send("Invalid color code specified (example: #FF00FF)");
        }
        var color = rg.exec(args[1])[0];
        new Jimp(256, 256, color, (err, image) => {
            if(err){
                console.error(err);
                return;
            }
            Jimp.loadFont(Jimp.FONT_SANS_32_WHITE).then(font_b => {
                Jimp.loadFont(Jimp.FONT_SANS_32_BLACK).then(font_w => {
                    image.print(
                        font_b,
                        0,
                        0,
                        {
                        text: color,
                        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                        alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM
                        },
                        256,
                        128
                    );
                    image.print(
                        font_w,
                        0,
                        128,
                        {
                        text: color,
                        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                        alignmentY: Jimp.VERTICAL_ALIGN_TOP
                        },
                        256,
                        128
                    );
                    image.getBuffer(Jimp.MIME_PNG, (err, val) => {
                        if(err){
                            console.error(err);
                            return;
                        }
                        message.channel.send(new Discord.MessageAttachment(val, color+".png"));
                    });
                });
            });
        });
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Color;