console.log("Imported shop");
function shop(message, client, Discord, db, gu) {
    gu(message.author.id, function (user) {
        var bs1_pr = Math.pow(1.2, user.bitminer1) * 50000;
        var bs2_pr = Math.pow(1.2, user.bitminer2) * 100000;
        var br_pr = Math.pow(1.2, user.bitminer_rack) * 200000;
        var brd_pr = Math.pow(1.2, user.bitm_dc) * 1200000;
        var ss_pr = Math.pow(1.2, user.solar_station) * 12000000;

        emb = new Discord.RichEmbed()
            .setTitle(`Магазин`)
            .setColor(0xFFFF00)
            .setDescription("!buy <номер предмета> <количество>")
            .addField("Битмайнеры:", `
            1. Bitminer S1 - 4.320 Поинтов в час. Цена ${parseInt(bs1_pr)} Поинтов
            2. Bitminer S2 - 9.000 Поинтов в час. Цена ${parseInt(bs2_pr)} Поинтов
            3. Bitminer Rack - 20.160 Поинтов в час. Цена ${parseInt(br_pr)} Поинтов
            4. Датацентр с битмайнерами - 100.080 Поинтов в час. Цена ${brd_pr} Поинтов`)
            .addField("Бизнесы:", `5. Солнечная электростанция - 21.6 опыта в час + 10.080 Поинтов в час. Цена ${ss_pr} Поинтов`)
            .addField("Привелегии:", `6. VIP - Будут доступны плюшки на некоторых серверах, хентай. Цена 100.000.000(100кк) Поинтов`)
            .addField("Другое:", `7. Корм для питона - +1 к скорости перехода на js. Цена 10.000 Поинтов`);
        message.channel.send(embed = emb);
    });
}
