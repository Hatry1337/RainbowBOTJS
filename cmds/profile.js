console.log("Imported profile");
function profile(message, Discord, db, client, gu, uu) {
    gu(message.author.id, function (user) {
        emb = new Discord.RichEmbed()
            .setTitle(`Профиль ${user.user}:`)
            .setColor(0x8b00ff)
            .addField("Количество Поинтов: ", user.user_points);
        if (user.user_group == "Banned") {
            emb.addField("Кто такой вообще: ", `Banned\nПричина: ${user.ban_reason}`)
            emb.addField("Уровень: ", user.user_lvl)
            emb.addField("Опыта: ", `${user.user_xp}/1000`)
            emb.addField("ID: ", user.num)
        } else {
            emb.addField("Кто такой вообще: ", user.user_group)
            emb.addField("Уровень: ", user.user_lvl)
            emb.addField("Опыта: ", `${user.user_xp}/1000`)
            emb.addField("ID: ",user.num)
        }
        message.channel.send(embed = emb);
        return;
    });
}
