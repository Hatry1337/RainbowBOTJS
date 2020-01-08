console.log("Imported pay");
function pay(message, Discord, db, client, gu, uu) {
    var args = message.content.split(" ");
    var id;
    if (!(args[1])) {
        message.channel.send("Вы не выбрали пользователя для передачи Поинтов.");
        return;
    }
    if (isNaN(args[2])) {
        message.channel.send("Количество Поинтов должно быть __числом__ больше 0!");
        return;
    } else {
        args[2] = parseInt(args[2]);
    }
    if (args[2] <= 0) {
        message.channel.send("Количество Поинтов не должно быть __меньше или равным 0__!");
        return;
    }

    if (args[1]) {
        var uarg = args[1].toString();
        uarg = uarg.replace("<@!", "");
        uarg = uarg.replace(">", "");
        id = uarg;
    }
    if (isNaN(parseInt(id))) {
        message.channel.send("Введен неверный ID!");
        return;
    }

    gu(message.author.id, function (a_user) {
        gu(id, function (b_user) {
            if (a_user.user_points < args[2]) {
                message.channel.send("У вас недостаточно Поинтов для передачи!");
                return;
            } else {
                a_user.user_points = a_user.user_points - args[2];
                b_user.user_points = b_user.user_points + args[2];
                uu(a_user.discord_id, a_user, function () {
                    uu(b_user.discord_id, b_user, function () {
                        message.channel.send(`Вы успешно передали ${args[2]} Поинтов Игроку ${b_user.user}`);
                        return;
                    });
                });
            }
        });
    });
}
