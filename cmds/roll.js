var moduleName = "Roll";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class Roll {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
    }
    execute = function (message) {
        var args = message.content.split(" ");
        var max_r = 100;
        if (args[1]) {
            if (!(isNaN(parseInt(args[1])))) {
                if (isFinite(parseInt(args[1]))) {
                    max_r = parseInt(args[1]);
                }
            }
        }
        var rand = Math.floor(Math.random() * max_r);
        var emb = new this.Discord.MessageEmbed()
            .setColor(0x6495ed)
            .setTitle(`Выпало число ${rand} из ${max_r}`);
        message.channel.send(emb);
        this.Database.writeLog('roll', message.author.id, message.guild.name,
            JSON.stringify({
                Message: `User '${message.author.tag}' rolled the dice. Dice number: '${rand}' of '${max_r}'.`
        }));
        return;
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Roll;
