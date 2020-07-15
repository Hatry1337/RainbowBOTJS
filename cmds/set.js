var moduleName = "Set";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class Set {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
    }
    execute = function (message) {
        var args = message.content.split(" ");
        var sub_cmd = args[1];
        var uid = args[2];
        var value = args[3];
        var value2 = args[4];
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
        var othis = this;
        this.Database.getUserByDiscordID(uid, function (user) {
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
            }else if (sub_cmd === "dbcol") {
                if(value2){
                    message.channel.send(`Пользователю ${user.user} был установлен параметр ${value} с "${user[value]}" на "${value2}"`);
                    user[value] = value2;
                    user = othis.Database.parseJsons(user);
                }else{
                    message.channel.send("No Database column value specified");
                    return;
                }
            }
            othis.Database.updateUser(uid, user, function () {
                return;
            });
        });
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Set;
