const RainbowBOT = require("../modules/RainbowBOT");
const Discord = require("discord.js");

class EightBall {
    /**
     * @param {RainbowBOT} rbot 
     */
    constructor(rbot){
        this.Name = "8ball";
        this.rbot = rbot;
        this.lng = rbot.localization;
        this.Database = rbot.Database;

        console.log(`Module "${this.Name}" loaded!`)
    }

    /**
     * 
     * @param {Discord.Message} message Discord Message object
     * @param {string} lang Language ("ru" || "en")
     * @param {Function} pipef Pipe callback function for !pipe command
     * @returns {Promise<Discord.Message>}
     */
    execute(message, lang, pipef) {
        return new Promise(async (resolve, reject) => {
            var question = message.content.slice(7);
            if (!(question)) {
                resolve(message.channel.send(this.lng.EBall.noQuestion[lang]));
            }
            var rand = Math.floor(Math.random() * this.lng.EBall.answs[lang].length);
            this.Database.writeLog('8Ball', message.author.id, message.guild.name,
                JSON.stringify({
                    Message: `User '${message.author.tag}' quested '${question}' and received answer is: '${rand}'.`
            }));
            if(pipef){
                resolve(await pipef(this.lng.EBall.answs[lang][rand]));
            }else {
                var emb = new Discord.MessageEmbed()
                    .setColor(0x6495ed)
                    .setTitle(question)
                    .setDescription(this.lng.EBall.answs[lang][rand])
                    .setThumbnail("https://www.dropbox.com/s/raw/vexrqo811ld5x6u/8-ball-png-9.png");
                resolve(message.channel.send(emb));
            }
        });
    }
}

module.exports = EightBall;
