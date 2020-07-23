var moduleName = "Buy";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class Buy {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
    }

    execute = function (message) {
        var args = message.content.split(" ");
        if (!args[1]) {
            return message.channel.send("Введите номер товара!");
        }
        if (isNaN(args[1])) {
            return message.channel.send("Номер товара должен быть __числом__ от 0 до 7!");
        }
        if ((args[1] > 7) || (args[1] <= 0)) {
            return message.channel.send("Номер товара не может быть __меньше 0 и больше 7__!");
        }
        var othis = this;
        this.Database.getUserByDiscordID(message.author.id, function (user) {
            var bs1_pr = 50000    * (1.2^(user.bitminer1));
            var bs2_pr = 100000   * (1.2^(user.bitminer2));
            var br_pr  = 200000   * (1.2^(user.bitminer_rack));
            var brd_pr = 1200000  * (1.2^(user.bitmdc));
            var ss_pr  = 12000000 * (1.2^(user.solar_station));

            function div(val, by) {
                return (val - val % by) / by;
            }
            function getPrice(id) {
                switch (id) {
                    case 1:
                        return bs1_pr;
                    case 2:
                        return bs2_pr;
                    case 3:
                        return br_pr;
                    case 4:
                        return brd_pr;
                    case 5:
                        return ss_pr;
                    case 6:
                        return 100000000;
                    case 7:
                        return 10000;
                    default:
                        return "invalid id";
                }
            }
            function getProd(id) {
                switch (id) {
                    case 1:
                        return "Bitminer S1";
                    case 2:
                        return "Bitminer S2";
                    case 3:
                        return "Bitminer Rack";
                    case 4:
                        return "Датацентр с битмайнерами";
                    case 5:
                        return "Солнечная электростанция";
                    case 6:
                        return "VIP";
                    case 7:
                        return "Корм для питона";
                    default:
                        return "invalid id";
                }
            }
            var count;
            if (args[2] == "all") {
                count = div(user.user_points, getPrice(parseInt(args[1])));
            } else if (!args[2]) {
                count = 1;
            } else {
                count = parseInt(args[2])
            }
            if ((isNaN(count)) || (count <= 0)) {
                return message.channel.send("Количество не может быть 0 или меньше.");
            }

            if (user.user_points < (count * getPrice(parseInt(args[1])))) {
                return message.channel.send(`Недостаточно Поинтов! Нужно: ${count * getPrice(parseInt(args[1]))}, у Вас: ${user.user_points}.`);
            } else {
                if (args[1] === "6") {
                    user.user_points = user.user_points - getPrice(parseInt(args[1]));
                    user.user_group = "VIP";
                    othis.Database.updateUser(user.discord_id, user, function () {
                        return message.channel.send(`Вы успешно купили VIP`);
                    });
                } else {
                    user.user_points = user.user_points - (count * getPrice(parseInt(args[1])));
                    switch (parseInt(args[1])) {
                        case 1:
                            user.bitminer1 = user.bitminer1 + count;
                            break;
                        case 2:
                            user.bitminer2 = user.bitminer2 + count;
                            break;
                        case 3:
                            user.bitminer_rack = user.bitminer_rack + count;
                            break;
                        case 4:
                            user.bitm_dc = user.bitm_dc + count;
                            break;
                        case 5:
                            user.solar_station = user.solar_station + count;
                            break;
                        case 6:
                            return;
                        case 7:
                            break;
                        default:
                            break;
                    }
                    othis.Database.updateUser(user.discord_id, user, function () {
                        message.channel.send(`Вы успешно купили ${getProd(parseInt(args[1]))} ${count} шт.`);
                        othis.Database.writeLog('Buy', message.author.id, message.guild.name,
                            JSON.stringify({
                                Message: `User '${message.author.tag}' buyed ${getProd(parseInt(args[1]))} ${count} pcs.`
                        }));
                        if (user.bm1_time === 0) {
                            user.bm1_time = new Date().getTime() / 1000;
                            othis.Database.updateUser(user.discord_id, user, function () {
                                message.channel.send(`Майнинг запущен!`);
                                return;
                            });
                        }
                        return;
                    });
                }
            }
        });
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Buy;