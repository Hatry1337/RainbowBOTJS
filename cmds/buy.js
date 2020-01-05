console.log("Imported buy");
function buy(message, Discord, db, client, gu, uu) {
    var args = message.content.split(" ");
    gu(message.author.id, function (user) {
        var bs1_pr = Math.pow(1.2, user.bitminer1) * 50000;
        var bs2_pr = Math.pow(1.2, user.bitminer2) * 100000;
        var br_pr = Math.pow(1.2, user.bitminer_rack) * 200000;
        var brd_pr = Math.pow(1.2, user.bitm_dc) * 1200000;
        var ss_pr = Math.pow(1.2, user.solar_station) * 12000000;

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
        } else if (!(args[2])) {
            count = 1;
        } else {
            count = parseInt(args[2])
        }

        if ((count == NaN) || (count <= 0)) {
            message.channel.send("Количество не может быть 0 или меньше.")
            return;
        }

        if (user.user_points < (count * getPrice(parseInt(args[1])))) {
            message.channel.send(`Недостаточно Поинтов! Нужно: ${count * getPrice(parseInt(args[1]))}, у Вас: ${user.user_points}.`);
            return;
        } else {
            if (args[1] == "6") {
                user.user_points = user.user_points - getPrice(parseInt(args[1]));
                user.user_group = "VIP";
                uu(user.discord_id, user, function () {
                    message.channel.send(`Вы успешно купили VIP`);
                    return;
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
                uu(user.discord_id, user, function () {
                    message.channel.send(`Вы успешно купили ${getProd(parseInt(args[1]))} ${count} шт.`);
                    if (user.bm1_time === 0) {
                        user.bm1_time = new Date().getTime() / 1000;
                        uu(user.discord_id, user, function () {
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