const RainbowBOT = require("../modules/RainbowBOT");
const Database = require("../modules/Database");
const Discord = require("discord.js");


class As {
    /**
     * @param {RainbowBOT} rbot 
     */
    constructor(rbot){
        this.Name = "As";
        this.rbot = rbot;
        this.lng = rbot.localization;

        this.rbot.on('command', async (message, user) => {
            if (message.content.startsWith(`!as `)) {
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
                if (!isNaN(parseInt(uid))) {
                    message.content = message.content.replace(`!as ${args[1]} `, "");
                    message.author = (await message.guild.member(uid)).user;
                    this.rbot.Client.emit("message", message);
                    resolve(message.channel.send(`Выполнение команды '${message.content}' от имени пользователя '${message.author.tag}'`));
                }else{
                    resolve(message.channel.send("Error: Invalid User ID specified."));
                }
            }else{
                resolve(message.channel.send("Error: Invalid Syntax\n```!ban <user> <time> <reason>\n\n<user>: @user or id\n<time>: 1s 1m 1h 1d 1w 1y'\n<reason>: any string```"));
            }
        });
    }
}

module.exports = As;