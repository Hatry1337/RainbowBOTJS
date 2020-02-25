
console.log("Imported rstats");

function rstats(message, client, date, Discord, fs, gdbl) {
    gdbl(function (usersCount) {
        emb = new Discord.MessageEmbed()
            .setColor(0x8b00ff)
            .setTitle("Статистика бота")
            .addFields([
                { name: "Пинг",                 value: `${parseInt(client.ws.ping)}ms.`},
                { name: "Количество серверов",  value: `${client.guilds.cache.size}`},
                { name: "Количество юзеров",    value: `${usersCount}` },
            ]);
        fs.readFile('stats.json', 'utf8', function (error, data) {
            emb.addFields([
                { name: "Сообщений за всё время",   value: `${JSON.parse(data).stats.messages}`},
                { name: "Аптайм",                   value: `${msToTime(new Date() - date)}`},
            ]);
            message.channel.send(embed = emb);
        });
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

//module.exports = { rstats };
