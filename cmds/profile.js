var moduleName = "Profile";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class Profile {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
        this.lng = Utils.lng;
        this.Utils = Utils;
    }
    execute = function (message, lang) {
        var args = message.content.split(" ");
        var id = message.author.id;
        if (args[1]) {
            id = this.Utils.parseID(args[1]);
        }
        var othis = this;
        this.Database.getUserByDiscordID(id, function (user) {
            if (!(user)) {
                message.channel.send(othis.lng.profile.notReged[lang]);
                return;
            }
            var emb = new othis.Discord.MessageEmbed()
                .setTitle(`${othis.lng.profile.profile[lang]} ${user.user}:`)
                .setColor(0x8b00ff);


            emb.addFields([{
                name: `${othis.lng.profile.poinCoun[lang]}: `, value: parseInt(user.user_points).toReadable()
            }]);
            if (user.user_group === "Banned") {
                emb.addFields([
                    { name: `${othis.lng.profile.whoAreYou[lang]}: `, value: `Banned\n${othis.lng.profile.reason[lang]}: ${user.ban_reason}` },
                ]);
            }else {
                emb.addFields([
                    { name: `${othis.lng.profile.whoAreYou[lang]}: `, value: user.user_group },
                ]);
            }
            emb.addFields([
                { name: `${othis.lng.profile.level[lang]}: `,     value: user.user_lvl },
                { name: `${othis.lng.profile.exp[lang]}: `,       value: `${user.user_xp}/1000`},
                { name: "ID: ",                                   value: user.num },
            ]);

            message.channel.send(emb);
            othis.Database.writeLog('profile', message.author.id, message.guild.name,
                JSON.stringify({
                    Message: `User '${message.author.tag}' watched profile of user '${user.user}'.`
            }));
            return;
        });
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Profile;
