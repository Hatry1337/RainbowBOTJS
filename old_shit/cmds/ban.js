const RainbowBOT = require("../modules/RainbowBOT");
const Database = require("../modules/Database");
const Discord = require("discord.js");


class Ban {
    /**
     * @param {RainbowBOT} rbot 
     */
    constructor(rbot){
        this.Name = "Ban";
        this.rbot = rbot;
        this.lng = rbot.localization;

        this.rbot.on('command', async (message, user) => {
            if (message.content.startsWith(`!ban`)) {
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
            var time = args[2];
            var reason = message.content.slice(message.content.indexOf(time)+time.length+1);

            if (uid && time && reason) {
                uid = this.rbot.Utils.parseID(uid);
                if (!isNaN(parseInt(uid))) {
                    var rex = /([0-9]*)(.)/i.exec(time);
                    if(rex[1] && rex[2]){
                        var stime = 0;
                        switch(rex[2]){
                            case "s":
                                stime += parseInt(rex[1]);
                                break;
    
                            case "m":
                                stime += parseInt(rex[1]) * 60;
                                break;
    
                            case "h":
                                stime += parseInt(rex[1]) * 60 * 60;
                                break;
    
                            case "d":
                                stime += parseInt(rex[1]) * 60 * 60 * 24;
                                break;
                                
                            case "w":
                                stime += parseInt(rex[1]) * 60 * 60 * 24 * 7;
                                break;
    
                            case "y":
                                stime += parseInt(rex[1]) * 60 * 60 * 24 * 365;
                                break;
                        }
                        var user = await Database.getUser(uid, this.rbot);
                        await user.ban(stime, reason, message.author.id);
                        resolve(message.channel.send(`Пользователь ${user.tag} был забанен на ${this.rbot.Utils.timeConversion(stime*1000, "ru")} Админом ${message.author.tag} по причине "${reason}"`));
                        Database.writeLog('ban', message.author.id, message.guild.name, {
                            Message: `User '${message.author.tag}' banned user '${user.tag}' on '${this.rbot.Utils.timeConversion(stime*1000, "en")}' with reason '${reason}'.`
                        });
                    }else{
                        resolve(message.channel.send("Error: Invalid time specified."));
                    }
                }else{
                    resolve(message.channel.send("Error: Invalid User ID specified."));
                }
            }else{
                resolve(message.channel.send("Error: Invalid Syntax\n```!ban <user> <time> <reason>\n\n<user>: @user or id\n<time>: 1s 1m 1h 1d 1w 1y'\n<reason>: any string```"));
            }
        });
    }
}

module.exports = Ban;
