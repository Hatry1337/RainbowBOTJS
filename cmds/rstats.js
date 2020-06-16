var moduleName = "Rstats";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class Rstats {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
        this.Client = Client;
        this.FS = Fs;
        this.DirName = Utils.DirName;
        this.Utils = Utils;
    }
    execute = function (message, date, lang) {
        var othis = this;
        this.Database.getDBLength(function (usersCount) {
            var emb = new othis.Discord.MessageEmbed()
                .setColor(0x8b00ff)
                .setTitle("Статистика бота")
                .addFields([
                    { name: "Пинг",                 value: `${parseInt(othis.Client.ws.ping)}ms.`},
                    { name: "Количество серверов",  value: `${othis.Client.guilds.cache.size}`},
                    { name: "Количество юзеров",    value: `${usersCount}` },
                ]);
            othis.FS.readFile(othis.DirName+'/stats.json', 'utf8', function (error, data) {
                emb.addFields([
                    { name: "Сообщений за всё время",   value: `${JSON.parse(data).stats.messages}`},
                    { name: "Аптайм",                   value: `${othis.Utils.timeConversion(new Date() - date, lang)}`},
                ]);
                message.channel.send(emb);
            });
        });
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Rstats;
