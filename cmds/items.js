console.log("Imported items");
function items(message, Discord, db, client, gu, uu) {
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
            .setTitle(`Предметы игрока ${user.user}:`)
            .setColor(0x228b22)
            .setDescription(
                `Количество Поинтов: ${user.user_points}
                Bitminer S1: ${user.bitminer1}
                Bitminer S2: ${user.bitminer2}
                Bitminer Rack: ${user.bitminer_rack}
                Датацентр с майнерами: ${user.bitm_dc}
                Солнечная Электростанция: ${user.bitminer_rack}`);
        message.channel.send(embed = emb);
        return;
    });
}
