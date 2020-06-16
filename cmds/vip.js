var moduleName = "Vip";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class Vip {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
        this.Utils = Utils;
    }
    execute = function (message, l) {
        var args = message.content.split(" ");
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
        var othis = this;
        this.Database.getUserByDiscordID(uid, function (user) {
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
                    viptime = othis.Utils.timeConversion((parseInt(value) * 60) * 1000, l);
                }
                message.channel.send(`Пользователь ${user.user} теперь VIP на ${viptime}`);

            } else if (sub_cmd === "remove") {
                user.vip_time = 0;
                user.user_group = "Player";
                message.channel.send(`Пользователь ${user.user} теперь Player`);
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
module.exports.class = Vip;
