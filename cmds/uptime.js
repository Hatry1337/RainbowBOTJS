console.log("Imported uptime");
function uptime(message, date, Discord, lng, l) {
    function timeConversion(millisec, lng, l) {
        var seconds = parseInt(millisec / 1000);
        var minutes = parseInt(millisec / (1000 * 60));
        var hours = parseInt(millisec / (1000 * 60 * 60));
        var days = parseInt(millisec / (1000 * 60 * 60 * 24));

        var stime;
        if (seconds < 60) {
            stime = `${seconds} ${lng.sec[l]}`;
        } else if (minutes < 60) {
            stime = `${minutes} ${lng.min[l]}, ${seconds - minutes * 60} ${lng.sec[l]}`;
        } else if (hours < 24) {
            stime = `${hours} ${lng.hur[l]}, ${minutes - hours * 60} ${lng.min[l]}, ${seconds - minutes * 60} ${lng.sec[l]}`;
        } else {
            stime = `${days} ${lng.day[l]}, ${hours - days * 24} ${lng.hur[l]}, ${minutes - hours * 60} ${lng.min[l]}, ${seconds - minutes * 60} ${lng.sec[l]}`;
        }
        return stime;
    }

    let cur_date = new Date();
    let normal = timeConversion(cur_date - date, lng, l);
    emb = new Discord.MessageEmbed()
        .setTitle(`${lng.uptime.title[l]}: ${normal}`)
        .setColor(0xe6e6e6);
    message.channel.send(embed = emb);
}




//module.exports = { uptime };