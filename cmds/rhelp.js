var moduleName = "Rhelp";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class Rhelp {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
        this.lng = Utils.lng;
    }
    execute = async function (message, lang) {
        var l = lang;
        var emb = new this.Discord.MessageEmbed()
            .setTitle(this.lng.rhelp.title[l])
            .addFields([
                { name: "!rhelp", value: this.lng.rhelp.rhelp[l], inline : true },
                { name: "!upd", value: this.lng.rhelp.upd[l], inline : true },
                { name: "!ukrmova", value: this.lng.rhelp.ukrmova[l], inline : true },
                { name: "!uptime", value: this.lng.rhelp.uptime[l], inline : true },
                { name: "!rstats", value: this.lng.rhelp.rstats[l], inline : true },
                { name: "!rep 'message'", value: this.lng.rhelp.rep[l], inline : true },
                { name: "!profile @user", value: this.lng.rhelp.profile[l], inline : true },
                { name: "!shop", value: this.lng.rhelp.shop[l], inline : true },
                { name: "!items @user", value: this.lng.rhelp.items[l], inline : true },
                { name: "!getmoney", value: this.lng.rhelp.getmoney[l], inline : true },
                { name: "!freevip", value: this.lng.rhelp.freevip[l], inline : true },
                { name: "!pay @user <count>", value: this.lng.rhelp.pay[l], inline : true },
                { name: "!hentai <picture id>", value: this.lng.rhelp.hentai[l], inline : true },
                { name: "!hentai like <picture id>", value: this.lng.rhelp.hntLike[l], inline: true},
                { name: "!hentai offer <picture url>", value: this.lng.rhelp.hntOffer[l], inline: true},
                { name: "!hentai stats", value: this.lng.rhelp.hntStats[l], inline: true },
                { name: "!play <youtube url or search request>", value: this.lng.rhelp.play[l], inline: true },
                { name: "!stop", value: this.lng.rhelp.stop[l], inline : true },
                { name: "!repeat", value: this.lng.rhelp.repeat[l], inline : true },
                { name: "!top", value: this.lng.rhelp.top[l], inline : true },
                { name: "!roll", value: this.lng.rhelp.roll[l], inline : true },
                { name: "!8ball <Question>", value: this.lng.rhelp.eightBall[l], inline : true },
                { name: "!randcat", value: this.lng.rhelp.randcat[l], inline : true },
                { name: "!lolilic", value: this.lng.rhelp.lolilic[l], inline : true },
                { name: "!rbfm", value: this.lng.rhelp.rbfm[l], inline : true },
            ]).setColor(0x8b00ff);
        var emb1 = new this.Discord.MessageEmbed()
            .setTitle(this.lng.rhelp.title[l])
            .addFields([
                { name: "!ascii", value: this.lng.rhelp.ascii[l], inline: true },
                { name: "!osuinfo <osu! nickname>", value: this.lng.rhelp.osuinfo[l], inline: true },

                { name: this.lng.rhelp.usableLinksT[l], value: this.lng.rhelp.usableLinks[l], inline: false },

            ]).setColor(0x8b00ff);
        message.channel.send(emb);
        message.channel.send(emb1);
        return;
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Rhelp;
