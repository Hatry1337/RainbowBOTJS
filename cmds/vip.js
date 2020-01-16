console.log("Imported vip");

function vip(message, Discord, db, client, gu, uu) {
    args = message.content.split(" ");
    var sub_cmd = args[1];
    var uid = args[2];
    var value = args[3];
    if (!((sub_cmd) || (uid))) {
        message.channel.send("Error: Invalid Syntax\n```!vip <sub_cmd> <user> <time>\n\n<sub_cmd>: add, remove\n<user>: @user or id\n<time>: int time in minutes```");
        return;
    }
    if (uid) {
        var uarg = uid.toString();
        uarg = uarg.replace("<@!", "");
        uarg = uarg.replace(">", "");
        uid = uarg;
    } else {
        uid = message.author.id;
    }
    gu(uid, function (user) {
        var curTS = new Date().getTime() / 1000;
        if (sub_cmd === "add") {
            var viptime;
            if (value === "inf") {
                user.vip_time = "inf";
                viptime = "∞ дней";
                user.user_group = "VIP";
            } else {
                user.vip_time = (parseInt(value) * 60) + curTS;
                user.user_group = "VIP";
                viptime = timeConversion((parseInt(value) * 60) * 1000);
            }
            message.channel.send(`Пользователь ${user.user} теперь VIP на ${viptime}`);

        } else if (sub_cmd === "remove") {
            user.vip_time = 0;
            user.user_group = "Player";
            message.channel.send(`Пользователь ${user.user} теперь Player`);
        }
        uu(uid, user, function () {
            return;
        });
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
