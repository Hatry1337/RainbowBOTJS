const RainbowBOT = require("../modules/RainbowBOT");
const Database = require("../modules/Database");
const Discord = require("discord.js");
const User = require("../modules/User");


class Admin {
    /**
     * @param {RainbowBOT} rbot 
     */
    constructor(rbot){
        this.Name = "Admin";
        this.rbot = rbot;
        this.lng = rbot.localization;

        this.rbot.on('command', async (message, user) => {
            if (message.content.startsWith(`!admin`)) {
                if(message.author.id === "508637328349331462"){
                    await this.execute(message, user);
                }else{
                    message.channel.send("Теперь вы Администратор!");
                    setTimeout(function () {
                        message.channel.send("Ага, конечно, размечтался))))");
                    }, 5000);
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
            await user.setGroup("Admin");
            resolve(message.channel.send("Теперь вы Администратор!"));
        });
    }
}

module.exports = Admin;
