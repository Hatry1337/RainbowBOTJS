console.log("Imported profile");
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
            message.channel.send(`Ваш доход за ${timeConversion(diff*1000)}: ${11}`);
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