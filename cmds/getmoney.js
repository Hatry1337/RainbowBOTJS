console.log("Imported getmoney");
function getmoney(message, Discord, db, client, gu, uu) {
    gu(message.author.id, function (user) {
        if (user.bm1_time === 0) {
            user.bm1_time = new Date().getTime() / 1000;
            uu(user.discord_id, user, function () {
                message.channel.send(`Майнинг запущен!`);
                return;
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
                message.channel.send(`Ваш доход за ${timeConversion(diff * 1000)}: ${parseInt(total_points)} Поинтов, ${parseInt(total_xp)} ед. Опыта`);
            } else {
                message.channel.send(`Ваш доход за ${timeConversion(diff * 1000)}: ${parseInt(total_points)} Поинтов`);
            }

            user.bm1_time = new Date().getTime() / 1000;
            uu(user.discord_id, user, function () {
                return;
            });
        }
    });
}

function timeConversion(millisec) {
    var seconds = parseInt(millisec / 1000);
    var minutes = parseInt(millisec / (1000 * 60));
    var hours = parseInt(millisec / (1000 * 60 * 60));
    var days = parseInt(millisec / (1000 * 60 * 60 * 24));

    var stime;
    if (seconds < 60) {
        stime = `${seconds} секунд`;
    } else if (minutes < 60) {
        stime = `${minutes} минут, ${seconds - minutes * 60} секунд`;
    } else if (hours < 24) {
        stime = `${hours} часов, ${minutes - hours * 60} минут, ${seconds - minutes * 60} секунд`;
    } else {
        stime = `${days} дней, ${hours - days * 24} часов, ${minutes - hours * 60} минут, ${seconds - minutes * 60} секунд`;
    }
    return stime;
}
