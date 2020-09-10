var moduleName = "Anecdot";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class Anecdot {
    constructor(Discord, Database, Client, Fs, Utils){
        this.Discord = Discord;
        this.lng = Utils.lng;
        this.Database = Database;
        this.Request = Utils.Request;
        this.win1251 = Utils.windows1251;
    }
    execute = async function (message, pipef) {
        var args = message.content.split(" ");
        var type = 1;
        if(args[1]){
            type = args[1];
        }
        if(type > 18 || type < 1){
            message.channel.send(
                "```" +
                "Error: Тип должен быть от 1 до 18\n" +
                "Доступные типы:\n" +
                "1 - Анекдот;\n" +
                "2 - Рассказы;\n" +
                "3 - Стишки;\n" +
                "4 - Афоризмы;\n" +
                "5 - Цитаты;\n" +
                "6 - Тосты;\n" +
                "8 - Статусы;\n" +
                "11 - Анекдот (+18);\n" +
                "12 - Рассказы (+18);\n" +
                "13 - Стишки (+18);\n" +
                "14 - Афоризмы (+18);\n" +
                "15 - Цитаты (+18);\n" +
                "16 - Тосты (+18);\n" +
                "18 - Статусы (+18);" +
                "```");
            return;
        }
        var othis = this;
        this.Request({
            uri: 'http://rzhunemogu.ru/RandJSON.aspx?CType='+type,
            method: 'GET',
            encoding: 'binary'
            }, async function (error, response, body) {
            var dec = othis.win1251.decode(body);
            var data = dec.substring(12, dec.length-2);
            console.log(dec);
            console.log(data);
            if(pipef){
                await pipef(data);
            }else {
                var emb = new othis.Discord.MessageEmbed()
                    .setColor(0x6495ed)
                    .setTitle("Анекдот:")
                    .setDescription(data);
                message.channel.send(emb);
            }
            othis.Database.writeLog('anecdot', message.author.id, message.guild.name,
                JSON.stringify({
                    Message: `User '${message.author.tag}' watched anecdot with text '${data}'.`
                }));
            return;
        });
    }
}


module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Anecdot;
