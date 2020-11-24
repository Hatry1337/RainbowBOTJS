const RainbowBOT = require("../modules/RainbowBOT");
const Discord = require("discord.js");
const Request = require("request");
const windows1251 = require('windows-1251');

class Anecdot {
    /**
     * @param {RainbowBOT} rbot 
     */
    constructor(rbot){
        this.Name = "Anecdot";
        this.rbot = rbot;
        this.lng = rbot.localization;
        this.Database = rbot.Database;

        console.log(`Module "${this.Name}" loaded!`)
    }

    /**
     * @param {Discord.Message} message Discord Message object
     * @param {Function} pipef Pipe callback function for !pipe command
     * @returns {Promise<Discord.Message>}
     */
    execute(message, pipef) {
        /**
         * @type {Anecdot}
         */
        var othis = this;
        return new Promise(async (resolve, reject) => {
            var args = message.content.split(" ");
            var type = 1;
            if(args[1]){
                type = args[1];
            }
            if(type > 18 || type < 1){
                reject(message.channel.send(
                    "```" +
                    "Error: Тип должен быть от 1 до 18\n" +
                    "Доступные типы:\n" +
                    "1 - Анекдот;\n" +
                    "2 - Рассказы;\n" +
                    "3 - Стишки;\n" +
                    "4 - Афоризмы;\n" +
                    "5 - Цитаты;\n" +
                    "6 - Тосты;\n" +
                    "8 - Статусы;\n" +
                    "11 - Анекдот (+18);\n" +
                    "12 - Рассказы (+18);\n" +
                    "13 - Стишки (+18);\n" +
                    "14 - Афоризмы (+18);\n" +
                    "15 - Цитаты (+18);\n" +
                    "16 - Тосты (+18);\n" +
                    "18 - Статусы (+18);" +
                    "```"));
            }
            Request({
                uri: 'http://rzhunemogu.ru/RandJSON.aspx?CType='+type,
                method: 'GET',
                encoding: 'binary'
            }, async (error, response, body) => {
                if(error) reject(error);
                var dec = windows1251.decode(body);
                var data = dec.substring(12, dec.length-2);
                if(pipef){
                    resolve(await pipef(data));
                }else {
                    var emb = new Discord.MessageEmbed()
                        .setColor(0x6495ed)
                        .setTitle("Анекдот:")
                        .setDescription(data);
                    resolve(message.channel.send(emb));
                }
                othis.rbot.Database.writeLog('anecdot', message.author.id, message.guild.name, JSON.stringify({
                    Message: `User '${message.author.tag}' watched anecdot with text '${data}'.`
                }));
            });
        });
    }
}

module.exports = Anecdot;
