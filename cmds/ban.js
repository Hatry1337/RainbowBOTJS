console.log("Imported ban");
function ban(message, Discord, db, client, gu, uu) {
    var args = message.content.split(" ");
    var uid = args[1];
    var reason = args[2];
    var time = args[3];
    if (!((uid) || (reason) || (time))) {
        message.channel.send("Error: Invalid Syntax\n```!ban <user> <reason> <time>\n\n<user>: @user or id\n<reason>: any'\n<time>: int (ban time in hours) or 'inf' for permban```");
        return;
    }
    if (uid) {
        var uarg = uid.toString();
        uarg = uarg.replace("<@!", "");
        uarg = uarg.replace(">", "");
        uid = uarg;
    } else {
        return;
    }
    gu(uid, function (user) {
        var curTS = new Date().getTime() / 1000;
        var btime;
        user.user_group = "Banned";
        user.ban_reason = reason;
        if (time === "inf") {
            user.ban_time = "inf";
            btime = "infinity";
        } else {
            user.ban_time = curTS + (parseInt(time) * 60) * 60
            btime = timeConversion(((parseInt(time) * 60) * 60) * 1000);
        }
        uu(user.discord_id, user, function () {
            message.channel.send(`Пользователь ${user.user} был забанен на ${btime} Админом ${message.author.tag}`);
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
