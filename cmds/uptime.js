var moduleName = "Uptime";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class Uptime {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Utils = Utils;
        this.lng = Utils.lng;
    }
    execute = function (message, date, lang) {
        var l = lang;
        let cur_date = new Date();
        let normal = this.Utils.timeConversion(cur_date - date, l);
        var emb = new this.Discord.MessageEmbed()
            .setTitle(`${this.lng.uptime.title[l]}: ${normal}`)
            .setColor(0xe6e6e6);
        message.channel.send(emb);
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Uptime;