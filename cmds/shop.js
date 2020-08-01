var moduleName = "Shop";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class Shop {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
        this.lng = Utils.lng;
    }
    execute = function (message) {
        var othis = this;
        this.Database.getUserByDiscordID(message.author.id, function (user) {
            var bs1_pr = 50000 * Math.pow(1.2, user.bitminer1);
            var bs2_pr = 100000 * Math.pow(1.2, user.bitminer2);
            var br_pr = 200000 * Math.pow(1.2, user.bitminer_rack);
            var brd_pr = 1200000 * Math.pow(1.2, user.bitm_dc);
            var ss_pr = 12000000 * Math.pow(1.2, user.solar_station);
            var emb = new othis.Discord.MessageEmbed()
                .setTitle(othis.lng.shop.name[user.lang])
                .setColor(0xFFFF00)
                .setDescription(othis.lng.shop.description[user.lang])
                .addFields([
                    {
                        name: othis.lng.shop.fields.bitminers.name[user.lang],
                        value:
                            `1. Bitminer S1 - 4.320 ${othis.lng.shop.pointsPerHour[user.lang]} ${Math.floor(bs1_pr)} ${othis.lng.shop.points[user.lang]}\n`+
                            `2. Bitminer S2 - 9.000 ${othis.lng.shop.pointsPerHour[user.lang]} ${Math.floor(bs2_pr)} ${othis.lng.shop.points[user.lang]}\n`+
                            `3. Bitminer Rack - 20.160 ${othis.lng.shop.pointsPerHour[user.lang]} ${Math.floor(br_pr)} ${othis.lng.shop.points[user.lang]}\n`+
                            `4. ${othis.lng.shop.fields.bitminers.datacenter[user.lang]} - 100.080 ${othis.lng.shop.pointsPerHour[user.lang]} ${Math.floor(brd_pr)} ${othis.lng.shop.points[user.lang]}\n`
                    },
                    { name: othis.lng.shop.fields.businesses.name[user.lang],     value: `5. ${othis.lng.shop.fields.businesses.solarStation[user.lang]} ${Math.floor(ss_pr)} ${othis.lng.shop.points[user.lang]}`},
                    { name: othis.lng.shop.fields.privileges.name[user.lang],  value: `6. ${othis.lng.shop.fields.privileges.VIP[user.lang]}` },
                    { name: othis.lng.shop.fields.other.name[user.lang],      value: `7. ${othis.lng.shop.fields.other.pythonFood[user.lang]}` },
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
