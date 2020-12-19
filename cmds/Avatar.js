const RainbowBOT = require("../modules/RainbowBOT");
const Database = require("../modules/Database");
const Discord = require("discord.js");


class Avatar {
    /**
     * @param {RainbowBOT} rbot 
     */
    constructor(rbot){
        this.Name = "Avatar";
        this.rbot = rbot;
        this.lng = rbot.localization;

        this.rbot.on('command', async (message) => {
            if (message.content.startsWith(`!avatar`)) {
                await this.execute(message);
            }
        });

        console.log(`Module "${this.Name}" loaded!`)
    }

    /**
     * 
     * @param {Discord.Message} message Discord Message object
     * @returns {Promise<Discord.Message>}
     */
    execute(message) {
        return new Promise(async (resolve, reject) => {
            var args = message.content.split(" ");
            if (args[1]) {
                args[1] = this.rbot.Utils.parseID(args[1]);
            } else {
                args[1] = message.author.id;
            }
            var user = await this.rbot.Client.users.fetch(args[1]);
            if(user){
                resolve(message.channel.send(user.username+"'s Avatar:",{
                    files: [user.avatarURL({
                        size: 2048
                    })]
                }));
                Database.writeLog('Avatar', message.author.id, message.guild.name, {
                    Message: `User '${message.author.tag}' watched avatar of user '${user.username}'.`
                });
            }else {
                resolve(message.channel.send("No user found with this id."));
            }
        });
    }
}

module.exports = Avatar;
