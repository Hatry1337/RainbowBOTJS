var moduleName = "Randcat";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class Randcat {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
        this.Request = Utils.Request;
    }
    execute = function (message) {
        var othis = this;
        this.Request('https://api.thecatapi.com/v1/images/search?size=full', function (error, response, body) {
            var data = JSON.parse(body);

            var emb = new othis.Discord.MessageEmbed()
                .setColor(0x6495ed)
                .setTitle("Random Cat")
                .setImage(data[0].url);
            message.channel.send(emb);
            return;
        });
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Randcat;
