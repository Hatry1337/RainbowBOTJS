var moduleName = "SayPM";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class SayPM {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
        this.Client = Client;
        this.Utils = Utils;
    }
    execute = function (message) {
        var args = message.content.split(" ");
        var uid = args[1];
        var toUserMsg = message.content.slice(8 + uid.length);
        if (!(uid)) {
            message.channel.send("Error: Invalid Syntax\n```!saypm <user> <message>\n\n<user>: @user or id\n<message>: any```");
            return;
        }
        if (uid) {
            uid = this.Utils.parseID(uid);
        } else {
            return;
        }
        if (isNaN(parseInt(uid))) {
            message.channel.send("Введен неверный ID!");
            return;
        }

        this.Client.users.cache.get(uid).send(`[Admin]${message.author.tag}: ${toUserMsg}`);
        message.channel.send(`Сообщение "${toUserMsg}" было отправлено пользователю ${this.Client.users.cache.get(uid).tag}`);
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = SayPM;
