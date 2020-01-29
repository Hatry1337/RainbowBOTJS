console.log("Imported profile");
function profile(message, Discord, db, client, gu, uu) {
    args = message.content.split(" ");
    var id = message.author.id;
    if (args[1]) {
        var uarg = args[1].toString();
        uarg = uarg.replace("<@!", "");
        uarg = uarg.replace(">", "");
        id = uarg;
        console.log(id)
    }
    gu(id, function (user) {
        if (!(user)) {
            message.channel.send("Данный пользователь не зарегистрирован!");
            return;
        }
        emb = new Discord.RichEmbed()
            .setTitle(`Профиль ${user.user}:`)
            .setColor(0x8b00ff)
            .addField("Количество Поинтов: ", parseInt(user.user_points));
        if (user.user_group == "Banned") {
            emb.addField("Кто такой вообще: ", `Banned\nПричина: ${user.ban_reason}`)
            emb.addField("Уровень: ", user.user_lvl)
            emb.addField("Опыта: ", `${user.user_xp}/1000`)
            emb.addField("ID: ", user.num)
        } else {
            emb.addField("Кто такой вообще: ", user.user_group)
            emb.addField("Уровень: ", user.user_lvl)
            emb.addField("Опыта: ", `${user.user_xp}/1000`)
            emb.addField("ID: ", user.num)
        }
        message.channel.send(embed = emb);
        return;
    });
}
