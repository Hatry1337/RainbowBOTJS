console.log("Imported set");
//ATTENTION! FUNCTION NAMED SETT() NOT SET() !!!!!!!!
function sett(message, Discord, db, client, gu, uu) {
    args = message.content.split(" ");
    var sub_cmd = args[1];
    var uid = args[2];
    var value = args[3];
    if (!((sub_cmd) || (uid) || (value))) {
        message.channel.send("Error: Invalid Syntax\n```!set <sub_cmd> <user> <value>\n\n<sub_cmd>: points, lvl, xp, group\n<user>: @user or id\n<value>: any```");
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
        if (sub_cmd === "points") {
            user.user_points = value;
            message.channel.send(`Пользователю ${user.user} было установлено ${value} Поинтов`);

        } else if (sub_cmd === "lvl") {
            user.user_lvl = value;
            message.channel.send(`Пользователю ${user.user} был установлен ${value} Уровень`);

        } else if (sub_cmd === "xp") {
            user.user_xp = value;
            message.channel.send(`Пользователю ${user.user} было установлено ${value} ед. Оптыа`);

        } else if (sub_cmd === "group") {
            user.user_group = value;
            message.channel.send(`Пользователю ${user.user} была установлена группа ${value}`);
        }
        uu(uid, user, function () {
            return;
        });
    });
}
