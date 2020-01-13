console.log("Imported osuinfo");

function osuinfo(message, Discord, request) {
    var args = message.content.split(" ");
    var osuUser = args[1];
    request.post({ url: 'https://osu.ppy.sh//api/get_user', form: { k: 'e5d6051cbf2455fd3f2c1240208aa4812594c6f0', u: osuUser } }, function (err, httpResponse, body) {
        var data = JSON.parse(body)[0];
        emb = new Discord.RichEmbed()
            .setColor(0xff669c)
            .setTitle(`:flag_${data.country.toLowerCase()}: ${data.username}'s Profile`)
            .setThumbnail(`https://a.ppy.sh/${data.user_id}`)
            .addField("Рейтинг в мире", `#${data.pp_rank}`, inline = true)
            .addField("Рейтинг в стране", `#${data.pp_country_rank}`, inline = true)
            .addField("PP", `${parseInt(data.pp_raw)}`, inline = true)
            .addField("Точность", `${parseFloat(data.accuracy).toFixed(2)}%`, inline = true)
            .addField("Игр сыграно", `${data.playcount}`, inline = true)
            .addField("Рейтинговые очки", `${data.ranked_score}`, inline = true)
            .addField("Всего очков", `${data.total_score}`, inline = true)
            .addField("Уровень", `${parseInt(data.level)}`, inline = true)
            .addField("Времени в игре", `${timeConversionOsu(data.total_seconds_played * 1000)}`, inline = true)
            .addField("Дата регистрации", `${data.join_date}`, inline = true)
        message.channel.send(emb);
        return;
    });
}

function timeConversionOsu(millisec) {
    var seconds = parseInt(millisec / 1000);
    var minutes = parseInt(millisec / (1000 * 60));
    var hours = parseInt(millisec / (1000 * 60 * 60));
    var days = parseInt(millisec / (1000 * 60 * 60 * 24));

    var stime;
    if (seconds < 60) {
        stime = `${seconds}s`;
    } else if (minutes < 60) {
        stime = `${minutes}m ${seconds - minutes * 60}s`;
    } else if (hours < 24) {
        stime = `${hours}h ${minutes - hours * 60}m ${seconds - minutes * 60}s`;
    } else {
        stime = `${days}d ${hours - days * 24}h ${minutes - hours * 60}m ${seconds - minutes * 60}s`;
    }
    return stime;
}
