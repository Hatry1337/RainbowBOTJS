var moduleName = "GetMoney";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class GetMoney {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
        this.Utils = Utils;
    }
    execute = function (message) {
        var othis = this;
        this.Database.getUserByDiscordID(message.author.id, function (user) {
            if (user.bm1_time === 0) {
                user.bm1_time = new Date().getTime() / 1000;
                othis.Database.updateUser(user.discord_id, user, function () {
                    return message.channel.send(`Майнинг запущен!`);
                });
            } else {
                var curTS = new Date().getTime() / 1000;
                var diff = curTS - user.bm1_time;
                var bm1_rate = 1.2;
                var bm2_rate = 2.5;
                var bmr_rate = 5.6;
                var bmdc_rate = 27.8;
                var ss_rate = 2.8;
                var ss_xp_rate = 0.006;

                var total_points =
                    (bm1_rate * diff) * user.bitminer1 +
                    (bm2_rate * diff) * user.bitminer2 +
                    (bmr_rate * diff) * user.bitminer_rack +
                    (bmdc_rate * diff) * user.bitm_dc +
                    (ss_rate * diff) * user.solar_station;

                var total_xp =
                    (ss_xp_rate * diff) * user.solar_station;

                total_points = parseInt(total_points);
                total_xp = parseInt(total_xp);

                user.user_points = user.user_points + total_points;
                user.user_xp = user.user_xp + total_xp;
                if (!(total_xp === 0)) {
                    message.channel.send(`Ваш доход за ${othis.Utils.timeConversion(diff * 1000, user.lang)}: ${parseInt(total_points)} Поинтов, ${parseInt(total_xp)} ед. Опыта`);
                    othis.Database.writeLog('Getmoney', message.author.id,
                        JSON.stringify({
                            Message: `User '${message.author.id}' getted ${parseInt(total_points)} points, and ${parseInt(total_xp)} xp.`
                    }));
                } else {
                    message.channel.send(`Ваш доход за ${othis.Utils.timeConversion(diff * 1000, user.lang)}: ${parseInt(total_points)} Поинтов`);
                    othis.Database.writeLog('Getmoney', message.author.id, JSON.stringify({
                        Message: `User '${message.author.id}' getted ${parseInt(total_points)} points.`
                    }));
                }
                user.bm1_time = new Date().getTime() / 1000;
                othis.Database.updateUser(user.discord_id, user, function () {
                    return;
                });
            }
        });
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = GetMoney;
