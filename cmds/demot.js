const RainbowBOT = require("../modules/RainbowBOT");
const Discord = require("discord.js");
const fs = require("fs");
const nodeHtmlToImage = require('node-html-to-image');

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
        return new Promise(async (resolve, reject) => {
            var args = message.content.split(" ");
            if (args[1]) {
                var header = this.rbot.Utils.extractDashParam(message.content, "header");
                var label = this.rbot.Utils.extractDashParam(message.content, "label");
                var htx_size = this.rbot.Utils.extractDashParam(message.content, "hdr_sz");
                var ltx_size = this.rbot.Utils.extractDashParam(message.content, "lab_sz");

                if(header || label){
                    var imgs = message.attachments.array();
                    if (imgs.length !== 0) {
                        await message.channel.send("Ok. Wait a little, demotivator creation process started.");
                        fs.readFile(process.env.dirname + "/demot_template.html", async (err, data) => {
                            await nodeHtmlToImage({
                                output: process.env.dirname + "/tempimg/demotes/" + imgs[0].id + imgs[0].name,
                                html: data.toString(),
                                content: {
                                    IMAGE_URL: imgs[0].proxyURL,
                                    TITLE_F_SIZE: htx_size + "px" || "72px",
                                    TEXT_F_SIZE:  ltx_size + "px" || "25px",
                                    TITLE_TEXT: header,
                                    TEXT_TEXT: label,
                                }
                            });
                            resolve(await message.channel.send("Done.", { files: [process.env.dirname + "/tempimg/demotes/" + imgs[0].id + imgs[0].name] }));
                            return;
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
                resolve(await message.channel.send("```Usage:\n!demot --header <text> --label <text> --hdr_sz <pixels> --lab_sz <pixels>\n\n--header <text> - Upper big text of demotivator\n--label <text> - Small bottom text of demotivator\n--hdr_sz <pixels> - Header font scale (default=72)\n--lab_sz <pixels> - Label font scale (default=25)```"));
                return;
            }
        });
    }
}

module.exports = Demot;