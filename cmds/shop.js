console.log("Imported shop");
function shop(message, client, Discord, db, gu) {
    gu(message.author.id, function (user) {
        var bs1_pr = Math.pow(1.2, user.bitminer1) * 50000;
        var bs2_pr = Math.pow(1.2, user.bitminer2) * 100000;
        var br_pr = Math.pow(1.2, user.bitminer_rack) * 200000;
        var brd_pr = Math.pow(1.2, user.bitm_dc) * 1200000;
        var ss_pr = Math.pow(1.2, user.solar_station) * 12000000;

        emb = new Discord.MessageEmbed()
            .setTitle(`Магазин`)
            .setColor(0xFFFF00)
            .setDescription("!buy <номер предмета> <количество>")
            .addFields([
                {
                  name: "Битмайнеры:",
                  value:
                        `1. Bitminer S1 - 4.320 Поинтов в час. Цена ${parseInt(bs1_pr)} Поинтов\n`+
                        `2. Bitminer S2 - 9.000 Поинтов в час. Цена ${parseInt(bs2_pr)} Поинтов\n`+
                        `3. Bitminer Rack - 20.160 Поинтов в час. Цена ${parseInt(br_pr)} Поинтов\n`+
                        `4. Датацентр с битмайнерами - 100.080 Поинтов в час. Цена ${brd_pr} Поинтов\n`
                },
                { name: "Бизнесы:",     value: `5. Солнечная электростанция - 21.6 опыта в час + 10.080 Поинтов в час. Цена ${ss_pr} Поинтов`},
                { name: "Привелегии:",  value: `6. VIP - Будут доступны плюшки на некоторых серверах, хентай. Цена 100.000.000(100кк) Поинтов` },
                { name: "Другое:",      value: `7. Корм для питона - +1 к скорости перехода на js. Цена 10.000 Поинтов` },
            ]);
        message.channel.send(embed = emb);
    });
}
