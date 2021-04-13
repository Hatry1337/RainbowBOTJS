var moduleName = "Rid";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class Rid {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
        this.Utils = Utils;
    }
    execute = function (message) {
        var tag = message.content.slice(5);

        var othis = this;
        this.Database.getUserByName(tag, function (user) {
            message.channel.send(`User tag: ${user.user}\nUser ID: ${user.discord_id}\nLang: ${user.lang}`);
            othis.Database.writeLog('rid', message.author.id, message.guild.name,
                JSON.stringify({
                    Message: `User '${message.author.tag}' resolved user '${user.user}'.`
            }));
        });
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Rid;
