var moduleName = "Pay";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class Pay {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
        this.Utils = Utils;
    }
    execute = function (message) {
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
        if (isNaN(parseInt(args[2]))) {
            message.channel.send("Не верное количество поинтов, возможно вы написали 2 пробела перед количеством.!");
            return;
        }

        id = this.Utils.parseID(args[1]);
        if (isNaN(parseInt(id))) {
            message.channel.send("Введен неверный ID!");
            return;
        }
        var othis = this;
        this.Database.getUserByDiscordID(message.author.id, function (a_user) {
            othis.Database.getUserByDiscordID(id, function (b_user) {
                if (!b_user) {
                    message.channel.send("Такого пользователя не существует, либо он не зарегистрирован!");
                    return;
                }
                if (a_user.user_points < args[2]) {
                    message.channel.send("У вас недостаточно Поинтов для передачи!");
                    return;
                } else {
                    a_user.user_points = a_user.user_points - args[2];
                    b_user.user_points = b_user.user_points + args[2];
                    othis.Database.updateUser(a_user.discord_id, a_user, function () {
                        othis.Database.updateUser(b_user.discord_id, b_user, function () {
                            message.channel.send(`Вы успешно передали ${intParse(args[2]).toReadable()} Поинтов Игроку ${b_user.user}`);
                            othis.Database.writeLog('Pay', message.author.id, message.guild.name,
                                JSON.stringify({
                                    Message: `User '${message.author.tag}' transfered ${args[2]} points to user '${b_user.user}'", "BUserID":"${b_user.discord_id}`
                                }));
                            return;
                        });
                    });
                }
            });
        });
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Pay;
