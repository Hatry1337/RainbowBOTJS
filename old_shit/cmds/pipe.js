const RainbowBOT = require("../modules/RainbowBOT");
const Database = require("../modules/Database");
const Discord = require("discord.js");
const User = require("../modules/User");


class Pipe {
    /**
     * @param {RainbowBOT} rbot 
     */
    constructor(rbot){
        this.Name = "Pipe";
        this.rbot = rbot;
        this.lng = rbot.localization;

        this.rbot.on('command', async (message, user) => {
            if (message.content.startsWith(`!pipe`)) {
                await this.execute(message, user);
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
            var msc = message.content.slice(6);
            var args = msc.split(" >> ");
            if (!args[0] || !args[1]) {
                message.channel.send("Error: No such arguments.");
                return;
            }
            if (args.length > 2) {
                message.channel.send("Error: Too much arguments.");
                return;
            }
            
            var ptext = "";
            
            message.content = args[0];
            if (args[0].startsWith(`!cowsay`)) {
                ptext = await this.rbot.Commands.CowSay.execute(message, user, true);
            }else if(args[0].startsWith(`!ascii`)) {
                ptext = await this.rbot.Commands.Ascii.execute(message, true);
            }

            if (args[1].startsWith(`!ascii`)) {
                message.content = `!ascii t ${args[1].split(" ")[1]}`;
                resolve(await this.rbot.Commands.Ascii.exec_pipe_in(message, ptext));
            } else if (args[1].startsWith(`!cowsay`)) {
                message.content = `!cowsay t ${args[1].slice(8)}`;
                console.log(message.content);
                resolve(await this.rbot.Commands.CowSay.exec_pipe_in(message, user, ptext));
            }
        });
    }
}

module.exports = Pipe;
