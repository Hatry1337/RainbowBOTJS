const Discord = require("discord.js");
const fs = require("fs");

function rstats(message, client, date) {
    emb = new Discord.RichEmbed()
        .setColor(0x8b00ff)
        .setTitle("Статистика бота")
        .addField("Пинг", `${client.ping}ms.`)
        .addField("Количество серверов", `${client.guilds.size}`)
        .addField("Количество юзеров", `${client.users.size}`)
        fs.readFile('stats.json', 'utf8', function (error, data) {
            emb.addField("Сообщений за всё время", `${JSON.parse(data).stats.messages}`)
            .addField("Аптайм", `${msToTime(new Date() - date)}`);
            message.channel.send(embed = emb);
        });
}
       



function msToTime(duration, show_days) {
    var seconds = parseInt((duration / 1000) % 60);
    var minutes = parseInt((duration / (1000 * 60)) % 60);
    var hours = parseInt((duration / (1000 * 60 * 60)) % 24);
    var days = parseInt(duration / (1000 * 60 * 60 * 24));
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    // Формат возвращаемого значения перепишите как Вам надо.
    return show_days ? (GetNumberWithPostfix(days, 'day') + ", " + hours + ":" + minutes + ":" + seconds) : (hours + ":" + minutes + ":" + seconds);
}

module.exports = { rstats };