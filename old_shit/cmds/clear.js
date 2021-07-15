const RainbowBOT = require("../modules/RainbowBOT");
const Database = require("../modules/Database");
const Discord = require("discord.js");
const User = require("../modules/User");


class Clear {
    /**
     * @param {RainbowBOT} rbot 
     */
    constructor(rbot){
        this.Name = "Clear";
        this.rbot = rbot;
        this.lng = rbot.localization;

        this.rbot.on('command', async (message, user) => {
            if (message.content.startsWith(`!clear`)) {
                if(message.member.permissions.has("MANAGE_MESSAGES")){
                    await this.execute(message, user);
                } else {
                    await message.channel.send(this.rbot.lng.clear.noPerms[l]);
                }
            }
        });

        console.log(`Module "${this.Name}" loaded!`)
    }

    /**
     * 
     * @param {Discord.Message} message Discord Message object
     * @param {User} user RainbowBOT User object
     * @returns {Promise<Discord.Message>}
     */
    execute(message, user) {
        return new Promise(async (resolve, reject) => {
            var args = message.content.split(" ");
            if (!args[1]) {
                resolve(message.channel.send(this.lng.clear.noCount[user.lang]));

            }else{
                var count = parseInt(args[1]);
                if (isNaN(count)) {
                    resolve(message.channel.send(this.lng.clear.notInt[user.lang]));

                }else if (count <= 0){
                    resolve(message.channel.send(this.lng.clear.underZero[user.lang]));

                }else if(count > 100){
                    resolve(message.channel.send(this.lng.clear.tooMore[user.lang]));

                }else{
                    await message.channel.bulkDelete(count).then(async msgs => {
                        var msg = await message.channel.send(`${this.lng.clear.succDel[user.lang]} ${delc} ${this.lng.clear.messages[user.lang]}!`);
                        resolve(msg.delete({timeout:5000}));
                        Database.writeLog('clear', message.author.id, message.guild.name,{
                            Message: `User '${message.author.tag}' deleted '${args[1]}' messages in channel '${message.channel.name}'.`
                        });
                    }).catch(e => {
                        if(e.code === 50034){
                            resolve(message.channel.send(this.lng.clear.bulkDelErr[user.lang]));
                        }
                    });
                }
            }
        });
    }
}

module.exports = Clear;