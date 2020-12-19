const RainbowBOT = require("../modules/RainbowBOT");
const Database = require("../modules/Database");
const Discord = require("discord.js");


class Profile {
    /**
     * @param {RainbowBOT} rbot 
     */
    constructor(rbot){
        this.Name = "Profile";
        this.rbot = rbot;
        this.lng = rbot.localization;

        this.rbot.on('command', async (message) => {
            if (message.content.startsWith(`!profile`)) {
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
            var id = message.author.id;
            if (args[1]) {
                id = this.rbot.Utils.parseID(args[1]);
            }
            var user = await Database.getUser(id, this.rbot);
            
            if (user) {
                var emb = new Discord.MessageEmbed()
                    .setTitle(`${this.lng.profile.profile[user.lang]} ${user.tag}:`)
                    .setColor(0x8b00ff);

                emb.addFields([{
                    name: `${this.lng.profile.money[user.lang]}: `, value: `${parseInt(user.money).toReadable()}$`
                }]);

                if (user.group === "Banned") {
                    emb.addFields([
                        { name: `${this.lng.profile.whoAreYou[user.lang]}: `, value: `Banned\n${this.lng.profile.reason[user.lang]}: ${user.meta.ban.reason}` },
                    ]);
                }else {
                    emb.addFields([
                        { name: `${this.lng.profile.whoAreYou[user.lang]}: `, value: user.group },
                    ]);
                }

                emb.addFields([
                    { name: `${this.lng.profile.level[user.lang]}: `,     value: user.lvl },
                    { name: `${this.lng.profile.exp[user.lang]}: `,       value: `${user.xp}/1000`},
                    { name: "ID: ",                                       value: user.id },
                ]);

                resolve(message.channel.send(emb));
                Database.writeLog('profile', message.author.id, message.guild.name, {
                    Message: `User '${message.author.tag}' watched profile of user '${user.user}'.`
                });

            }else{
                resolve(message.channel.send(this.lng.profile.notReged[user.lang]));
            }
        });
    }
}

module.exports = Profile;
