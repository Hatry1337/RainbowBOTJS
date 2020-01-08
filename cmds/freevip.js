console.log("Imported freevip");
function freevip(message, Discord, db, client, gu, uu, dbl) {
    gu(message.author.id, function (user) {
        var cur_ts = new Date().getTime() / 1000;
        if (user.user_group === "VIP") {
            var vip_void;
            if (user.vip_time === "inf") {
                vip_void = "Не закончится)";
            } else {
                vip_void = timeConversion((parseInt(user.vip_time - cur_ts)) * 1000);
            }
            message.channel.send(`У вас уже есть VIP статус, наслаждайтесь :)\nЗакончится через: ${vip_void}`);
            return;
        } else {
            dbl.hasVoted(message.author.id).then(isVoted => {
                if (!(isVoted)) {
                    message.channel.send("Для получения VIP проголосуйте на сайте за нашего бота:\nhttps://top.gg/bot/571948993643544587\nДля проверки вашего голоса напишите команду снова\n```Статус: Голоса Нет```")
                    console.log(isVoted);
                    return;
                } else {
                    message.channel.send("Для получения VIP проголосуйте на сайте за нашего бота:\nhttps://top.gg/bot/571948993643544587\nДля проверки вашего голоса напишите команду снова\n```Статус: Голос Есть```")
                    console.log(isVoted);
                    if (isVoted) {
                        var vip_time = cur_ts + 43200;
                        user.vip_time = vip_time;
                        user.user_group = "VIP";
                        user.user_points = user.user_points + 30000;
                        uu(message.author.id, user, function () {
                            message.channel.send("Вы получили VIP на 12 часов + бонус 30.000 Поинтов!");
                            return;
                        });
                    }
                }
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
