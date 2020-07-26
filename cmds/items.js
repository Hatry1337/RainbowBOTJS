var moduleName = "Items";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class Items {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
        this.Utils = Utils;
    }
    execute = function (message) {
        var args = message.content.split(" ");
        var id = message.author.id;
        if (args[1]) {
            id = this.Utils.parseID(args[1]);
        }
        var othis = this;
        this.Database.getUserByDiscordID(id, function (user) {
            if (!(user)) {
                message.channel.send("Данный пользователь не зарегистрирован!");
                return;
            }
            var bm1_rate = 1.2 * 60 * 60;
            var bm2_rate = 2.5 * 60 * 60;
            var bmr_rate = 5.6 * 60 * 60;
            var bmdc_rate = 27.8 * 60 * 60;
            var ss_rate = 2.8;

            var mining_speed = (bm1_rate * user.bitminer1) + (bm2_rate * user.bitminer2) + (bmr_rate * user.bitminer_rack) + (bmdc_rate * user.bitm_dc);

            var emb = new othis.Discord.MessageEmbed()
                .setTitle(`Предметы игрока ${user.user}:`)
                .setColor(0x228b22)
                .setDescription(
                    `Количество Поинтов: ${parseInt(user.user_points)}\n`+
                    `Bitminer S1: ${user.bitminer1}\n`+
                    `Bitminer S2: ${user.bitminer2}\n`+
                    `Bitminer Rack: ${user.bitminer_rack}\n`+
                    `Датацентр с майнерами: ${user.bitm_dc}\n`+
                    `Солнечная Электростанция: ${user.solar_station}\n\n`+
                    `Общая скорость майнинга: ${mining_speed} Поинтов в час.`
                );
            message.channel.send(emb);
            return;
        });
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Items;
