var moduleName = "Profile";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class Profile {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
        this.lng = Utils.lng;
    }
    execute = function (message, lang) {
        var args = message.content.split(" ");
        var id = message.author.id;
        if (args[1]) {
            var uarg = args[1].toString();
            uarg = uarg.replace("<@!", "");
            uarg = uarg.replace(">", "");
            id = uarg;
            console.log(id)
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
                name: `${othis.lng.profile.poinCoun[lang]}: `, value: parseInt(user.user_points)
            }]);
            if (user.user_group === "Banned") {
                emb.addFields([
                    { name: `${othis.lng.profile.whoAreYou[lang]}: `, value: `Banned\n${othis.lng.profile.reason[lang]}: ${user.ban_reason}` },
                ]);
            }
            emb.addFields([
                { name: `${othis.lng.profile.whoAreYou[lang]}: `, value: user.user_group },
                { name: `${othis.lng.profile.level[lang]}: `,     value: user.user_lvl },
                { name: `${othis.lng.profile.exp[lang]}: `,       value: `${user.user_xp}/1000`},
                { name: "ID: ",                                   value: user.num },
            ]);

            message.channel.send(emb);
            return;
        });
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Profile;
