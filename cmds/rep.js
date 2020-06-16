var moduleName = "Report";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class Report {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
        this.Client = Client;
    }
    execute = function (message) {
        var question = message.content.slice(5);
        if (!(question)) {
            message.channel.send("Вы не ввели сообщение!");
            return;
        }

        this.Client.users.cache.get('508637328349331462').send(`[${message.author.id}]${message.author.tag}: ${question}`);
        this.Client.users.cache.get('373718196794032130').send(`[${message.author.id}]${message.author.tag}: ${question}`);
        message.channel.send(`Сообщение "${question}" было отправлено Администратору!`);
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Report;
