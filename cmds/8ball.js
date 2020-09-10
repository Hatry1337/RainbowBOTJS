var moduleName = "8ball";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class EightBall {
    constructor(Discord, Database, Client, Fs, Utils){
        this.Discord = Discord;
        this.lng = Utils.lng;
        this.Database = Database;
    }
    execute = async function (message, lang, pipef) {
        var question = message.content.slice(7);
        if (!(question)) {
            message.channel.send(this.lng.EBall.noQuestion[lang]);
            return;
        }
        var rand = Math.floor(Math.random() * this.lng.EBall.answs[lang].length);
        this.Database.writeLog('8Ball', message.author.id, message.guild.name,
            JSON.stringify({
                Message: `User '${message.author.tag}' quested '${question}' and received answer: '${rand}'.`
        }));
        var emb = new this.Discord.MessageEmbed()
            .setColor(0x6495ed)
            .setTitle(question)
            .setDescription(this.lng.EBall.answs[lang][rand])
            .setThumbnail("https://www.dropbox.com/s/raw/vexrqo811ld5x6u/8-ball-png-9.png");
        if(pipef){
            await pipef(this.lng.EBall.answs[lang][rand]);
        }
        return message.channel.send(emb);
    }
}


module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = EightBall;
