const Discord = require("discord.js");

function uptime(message, date) {
    let cur_date = new Date();
    let normal = msToTime(cur_date - date);
    emb = new Discord.RichEmbed()
        .setTitle(`Бот онлайн: ${normal}`)
        .setColor(0xe6e6e6);
    message.channel.send(embed = emb);
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

module.exports = { uptime };