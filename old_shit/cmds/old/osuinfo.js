var moduleName = "OsuInfo";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class OsuInfo {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Request = Utils.Request;
        this.Database = Database;
        this.Client = Client;
    }

    timeConversionOsu = function (millisec) {
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
    };
    execute = function (message) {
        var othis = this;
        var args = message.content.split(" ");
        var osuUser = args[1];
        var gameMode = 0;
        if(args.length < 2){
            message.channel.send("Введите никнейм игрока osu!");
            return;
        }else if(args.length >= 3) {
            switch (args[1].toLowerCase()){
                case "taiko":
                    gameMode = 1;
                    break;
                case "catch":
                    gameMode = 2;
                    break;
                case "mania":
                    gameMode = 3;
                    break;
                default:
                    gameMode = 0;
                    break;
            }
            osuUser = args[2];
        }else {
            osuUser = args[1];
        }

        if (osuUser) {
            var othis = this;
            this.Request.post({
                url: 'https://osu.ppy.sh/api/get_user',
                form: {k: 'e5d6051cbf2455fd3f2c1240208aa4812594c6f0', u: osuUser, m: gameMode}
            }, function (err, httpResponse, profile_b) {
                var data = JSON.parse(profile_b)[0];
                othis.Request.post({
                    url: 'https://osu.ppy.sh/api/get_user_best',
                    form: {k: 'e5d6051cbf2455fd3f2c1240208aa4812594c6f0', u: osuUser, m: gameMode, limit: 1}
                }, function (err, httpResponse, score_b) {
                    var score = JSON.parse(score_b)[0];
                    if(score){
                        othis.Request.post({
                            url: 'https://osu.ppy.sh/api/get_beatmaps',
                            form: {k: 'e5d6051cbf2455fd3f2c1240208aa4812594c6f0', b: score.beatmap_id, limit: 1}
                        }, function (err, httpResponse, map_b) {
                            var map = JSON.parse(map_b)[0];
                            var emb = new othis.Discord.MessageEmbed()
                                .setColor(0xff669c)
                                .setTitle(`${othis.Client.emojis.cache.find(emoji => emoji.name === `osu_md${gameMode}`)} :flag_${data.country.toLowerCase()}: ${data.username}'s Profile`)
                                .setThumbnail(`https://a.ppy.sh/${data.user_id}`)
                                .addFields([
                                    {name: "Рейтинг в мире", value: `#${data.pp_rank}`, inline: true},
                                    {name: "Рейтинг в стране", value: `#${data.pp_country_rank}`, inline: true},
                                    {name: "Профиль", value: `[${data.username}](https://osu.ppy.sh/users/${data.user_id})`, inline: true},
                                    {name: "PP", value: `${parseInt(data.pp_raw)}`, inline: true},
                                    {name: "Точность", value: `${parseFloat(data.accuracy).toFixed(2)}%`, inline: true},
                                    {name: "Игр сыграно", value: `${data.playcount}`, inline: true},
                                    {name: "Рейтинговые очки", value: `${data.ranked_score}`, inline: true},
                                    {name: "Всего очков", value: `${data.total_score}`, inline: true},
                                    {name: "Уровень", value: `${parseInt(data.level)}`, inline: true},
                                    {
                                        name: "Времени в игре",
                                        value: `${othis.timeConversionOsu(data.total_seconds_played * 1000)}`,
                                        inline: true
                                    },
                                    {name: "Дата регистрации", value: `${data.join_date}`, inline: true},
                                ]);
                            if(map){
                                emb.addFields([{name: "Best Score", value: `[${Number((parseFloat(map.difficultyrating)).toFixed(2))}★] ${othis.Client.emojis.cache.find(emoji => emoji.name === `rank_${score.rank}`)} [**${map.title}** от **${map.artist}**](https://osu.ppy.sh/b/${map.beatmap_id}) ${Number(parseFloat(score.pp)).toFixed(0)}pp`, inline: false},])
                            }
                            message.channel.send(emb);
                            othis.Database.writeLog('osuinfo', message.author.id, message.guild.name,
                                JSON.stringify({
                                    Message: `User '${message.author.tag}' watched osu! profile of user '${data.username}'.`
                                }));
                            return;
                        });
                    }else {
                        message.channel.send("Такой пользователь не найден!");
                        return;
                    }
                });
            });

        }else {
            message.channel.send("Введите Ник игрока osu!");
            return;
        }
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = OsuInfo;
