const RainbowBOT = require("../modules/RainbowBOT");
const Database = require("../modules/Database");
const Discord = require("discord.js");


class Pinggg {
    /**
     * @param {RainbowBOT} rbot 
     */
    constructor(rbot){
        this.Name = "Pinggg";
        this.rbot = rbot;
        this.lng = rbot.localization;

        this.rbot.on('command', async (message, user) => {
            if (message.content.startsWith(`!pinggg`)) {
                if (user.group === "Admin") {
                    await this.execute(message);
                } else {
                    await message.channel.send("У вас нет прав администратора!");
                }
            }
        });

        console.log(`Module "${this.Name}" loaded!`)
    }

    /**
     * 
     * @param {Discord.Message} message Discord Message object
     * @returns {Promise<Discord.Message>}
     */
    execute(message, user) {
        return new Promise(async (resolve, reject) => {
            var args = message.content.split(" ");
            var uid = args[1];
            if (uid) {
                uid = this.rbot.Utils.parseID(uid);
                for(var i = 0; i < 4; i++){
                    message.channel.send("<@!"+uid+">");
                }
                resolve(message.channel.send("<@!"+uid+">"));
            }else{
                resolve(message.channel.send("No user to pinggg specified!"));
            }
        });
    }
}

module.exports = Pinggg;
