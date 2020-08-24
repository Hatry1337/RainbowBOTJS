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
            othis.Database.getCountLogs("Command", function (msgAll) {
                var stamp = new Date();
                var stamp1 = new Date();
                stamp.setMinutes(0);
                stamp1.setMinutes(0);
                stamp1.setHours(0);
                stamp = stamp / 1000;
                stamp1 = stamp1 / 1000;
                othis.Database.getCountLogsRange("Command", stamp, stamp + 3600, function (msgHour) {
                    othis.Database.getCountLogsRange("Command", stamp1, stamp1 + 84000, function (msgDay) {
                        var emb = new othis.Discord.MessageEmbed()
                            .setColor(0x8b00ff)
                            .setTitle("Статистика бота")
                            .addFields([
                                { name: "Пинг", value: `${parseInt(othis.Client.ws.ping)}ms.` },
                                { name: "Количество серверов", value: `${othis.Client.guilds.cache.size}` },
                                { name: "Количество юзеров", value: `${usersCount}` },
                                { name: "Сообщений за этот час", value: `${msgHour}` },
                                { name: "Сообщений за сегодня", value: `${msgDay}` },
                                { name: "Сообщений за всё время", value: `${msgAll}` },
                                { name: "Аптайм", value: `${othis.Utils.timeConversion(new Date() - date, lang)}` },
                            ]);
                        message.channel.send(emb);
                        othis.Database.writeLog('rstats', message.author.id, message.guild.name,
                            JSON.stringify({
                                Message: `User '${message.author.tag}' watched rstats. Rstats: P:'${parseInt(othis.Client.ws.ping)}', CS:'${othis.Client.guilds.cache.size}', CU:'${usersCount}', MH: '${msgHour}', MD:'${msgDay}', MALL: '${msgAll}', U:'${othis.Utils.timeConversion(new Date() - date, lang)}'.`
                        }));
                    });
                });
            });
        });
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Rstats;
