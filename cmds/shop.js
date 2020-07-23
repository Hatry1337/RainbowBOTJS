var moduleName = "Shop";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class Shop {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
    }
    execute = function (message) {
        var othis = this;
        this.Database.getUserByDiscordID(message.author.id, function (user) {
            var bs1_pr = 50000 * 1.2^(user.bitminer1);
            var bs2_pr = 100000 * 1.2^(user.bitminer2);
            var br_pr  = 200000 * 1.2^(user.bitminer_rack);
            var brd_pr = 1200000 * 1.2^(user.bitmdc);
            var ss_pr  = 12000000 * 1.2^(user.solar_station);

            var emb = new othis.Discord.MessageEmbed()
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
            message.channel.send(emb);
        });
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Shop;
