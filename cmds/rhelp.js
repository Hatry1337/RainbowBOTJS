
console.log("Imported rhelp");

function rhelp(message, Discord, lng, l) {
    emb = new Discord.MessageEmbed()
        .setTitle(lng.rhelp.title[l])
        .addFields([
            { name: "!rhelp", value: lng.rhelp.rhelp[l], inline : true },
            { name: "!upd", value: lng.rhelp.upd[l], inline : true },
            { name: "!ukrmova", value: lng.rhelp.ukrmova[l], inline : true },
            { name: "!uptime", value: lng.rhelp.uptime[l], inline : true },
            { name: "!rstats", value: lng.rhelp.rstats[l], inline : true },
            { name: "!rep 'message'", value: lng.rhelp.rep[l], inline : true },
            { name: "!profile @user", value: lng.rhelp.profile[l], inline : true },
            { name: "!shop", value: lng.rhelp.shop[l], inline : true },
            { name: "!items @user", value: lng.rhelp.items[l], inline : true },
            { name: "!getmoney", value: lng.rhelp.getmoney[l], inline : true },
            { name: "!freevip", value: lng.rhelp.freevip[l], inline : true },
            { name: "!pay @user <count>", value: lng.rhelp.pay[l], inline : true },
            { name: "!hentai <picture id>", value: lng.rhelp.hentai[l], inline : true },
            { name: "!hentai like <picture id>", value: lng.rhelp.hntLike[l], inline: true},
            { name: "!hentai offer <picture url>", value: lng.rhelp.hntOffer[l], inline: true},
            { name: "!hentai stats", value: lng.rhelp.hntStats[l], inline: true },
            { name: "!play <youtube url or search request>", value: lng.rhelp.play[l], inline: true },
            { name: "!stop", value: lng.rhelp.stop[l], inline : true },
            { name: "!top", value: lng.rhelp.top[l], inline : true },
            { name: "!roll", value: lng.rhelp.roll[l], inline : true },
            { name: "!8ball <Question>", value: lng.rhelp.eightBall[l], inline : true },
            { name: "!randcat", value: lng.rhelp.randcat[l], inline : true },
            { name: "!lolilic", value: lng.rhelp.lolilic[l], inline : true },

            { name: lng.rhelp.usableLinksT[l], value: lng.rhelp.usableLinks[l], inline : false },

        ])
        .setColor(0x8b00ff);
    message.channel.send(embed = emb);
}
//module.exports = {rhelp}
