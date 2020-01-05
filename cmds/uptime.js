console.log("Imported uptime");
function uptime(message, date, Discord) {
    let cur_date = new Date();
    let normal = timeConversion(cur_date - date);
    emb = new Discord.RichEmbed()
        .setTitle(`Бот онлайн: ${normal}`)
        .setColor(0xe6e6e6);
    message.channel.send(embed = emb);
}


function timeConversion(millisec) {
    var seconds = parseInt(millisec / 1000);
    var minutes = parseInt(millisec / (1000 * 60));
    var hours = parseInt(millisec / (1000 * 60 * 60));
    var days = parseInt(millisec / (1000 * 60 * 60 * 24));

    var stime;
    if (seconds < 60) {
        stime = `${seconds} секунд`;
    } else if (minutes < 60) {
        stime = `${minutes} минут, ${seconds-minutes*60} секунд`;
    } else if (hours < 24) {
        stime = `${hours} часов, ${minutes - hours * 60} минут, ${seconds - minutes * 60} секунд`;
    } else {
        stime = `${days} дней, ${hours-days*24} часов, ${minutes - hours * 60} минут, ${seconds - minutes * 60} секунд`;
    }
    return stime;
}

//module.exports = { uptime };