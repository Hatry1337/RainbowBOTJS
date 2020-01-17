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
        var bm1_rate = 1.2 * 60 * 60;
        var bm2_rate = 2.5 * 60 * 60;
        var bmr_rate = 5.6 * 60 * 60;
        var bmdc_rate = 27.8 * 60 * 60;
        var ss_rate = 2.8;

        var mining_speed = (bm1_rate * user.bitminer1) + (bm2_rate * user.bitminer2) + (bmr_rate * user.bitminer_rack) + (bmdc_rate * user.bitm_dc);

        emb = new Discord.RichEmbed()
            .setTitle(`Предметы игрока ${user.user}:`)
            .setColor(0x228b22)
            .setDescription(`
Количество Поинтов: ${user.user_points}
Bitminer S1: ${user.bitminer1}
Bitminer S2: ${user.bitminer2}
Bitminer Rack: ${user.bitminer_rack}
Датацентр с майнерами: ${user.bitm_dc}
Солнечная Электростанция: ${user.solar_station}

Общая скорость майнинга: ${mining_speed} Поинтов в час.               
`);
        message.channel.send(embed = emb);
        return;
    });
}
