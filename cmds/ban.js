var moduleName = "Ban";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class Ban {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
        this.Utils = Utils;
    }
    execute = function (message) {
        var args = message.content.split(" ");
        var uid = args[1];
        var reason = args[2];
        var time = args[3];
        if (!((uid) || (reason) || (time))) {
            return message.channel.send(
                "Error: Invalid Syntax\n```!ban <user> <reason> <time>\n\n<user>: @user or id\n<reason>: any'\n<time>: int (ban time in hours) or 'inf' for permban```"
            );
        }
        if (uid) {
            uid = this.Utils.parseID(uid);
        } else {
            return;
        }
        if (isNaN(parseInt(uid))) {
            return message.channel.send("Введен неверный ID!");
        }
        var othis = this;
        this.Database.getUserByDiscordID(uid, function (user) {
            var curTS = new Date().getTime() / 1000;
            var btime;
            user.user_group = "Banned";
            user.ban_reason = reason;
            if (time === "inf") {
                user.ban_time = "inf";
                btime = "infinity";
            } else {
                user.ban_time = curTS + (parseInt(time) * 60) * 60;
                btime = othis.Utils.timeConversion(((parseInt(time) * 60) * 60) * 1000);
            }
            othis.Database.updateUser(user.discord_id, user, function () {
                return message.channel.send(`Пользователь ${user.user} был забанен на ${btime} Админом ${message.author.tag}`);
            });
        });
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Ban;