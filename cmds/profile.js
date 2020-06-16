var moduleName = "Profile";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class Profile {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
    }
    execute = function (message) {
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
                message.channel.send("Данный пользователь не зарегистрирован!");
                return;
            }
            var emb = new othis.Discord.MessageEmbed()
                .setTitle(`Профиль ${user.user}:`)
                .setColor(0x8b00ff)
                .addFields({ name: "Количество Поинтов: ", value: parseInt(user.user_points) });
            if (user.user_group === "Banned") {
                emb.addFields([
                    { name: "Кто такой вообще: ", value: `Banned\nПричина: ${user.ban_reason}` },
                    { name: "Уровень: ", value: user.user_lvl },
                    { name: "Опыта: ", value: `${user.user_xp}/1000` },
                    { name: "ID: ", value: user.num },
                ]);
            } else {
                emb.addFields([
                    { name: "Кто такой вообще: ", value: user.user_group },
                    { name: "Уровень: ",          value: user.user_lvl },
                    { name: "Опыта: ",            value: `${user.user_xp}/1000`},
                    { name: "ID: ",               value: user.num },
                ]);
            }
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
