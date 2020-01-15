console.log("Imported top");
function top(message, Discord, db, client, gau) {
    gau(function (users) {
        var usersByPoints = sortUsersByPoints(unique(users))
        curUserPlace = usersByPoints.findIndex(x => x.discord_id === message.author.id);
        console.log(curUserPlace);
        console.log(usersByPoints);

        emb = new Discord.RichEmbed()
            .setColor(0x8b00ff)
            .setTitle(`Топ игроков по Поинтам`)
            .setDescription(`
:one: **${usersByPoints[0].user}** - _${usersByPoints[0].user_points}_ поинтов
:two: **${usersByPoints[1].user}** - _${usersByPoints[1].user_points}_ поинтов
:three: **${usersByPoints[2].user}** - _${usersByPoints[2].user_points}_ поинтов
:four: **${usersByPoints[3].user}** - _${usersByPoints[3].user_points}_ поинтов
:five: **${usersByPoints[4].user}** - _${usersByPoints[4].user_points}_ поинтов
:six: **${usersByPoints[5].user}** - _${usersByPoints[5].user_points}_ поинтов
:seven: **${usersByPoints[6].user}** - _${usersByPoints[6].user_points}_ поинтов
:eight: **${usersByPoints[7].user}** - _${usersByPoints[7].user_points}_ поинтов
:nine: **${usersByPoints[8].user}** - _${usersByPoints[8].user_points}_ поинтов
:keycap_ten: **${usersByPoints[9].user}**  _${usersByPoints[9].user_points}_ поинтов

Вы на ${curUserPlace + 1} месте.
`)
        message.channel.send(emb);
    });
}

function sortUsersByPoints(arr) {
    return arr.sort((a, b) => a.user_points > b.user_points ? -1 : 1);
}
function sortUsersByLvl(arr) {
    return arr.sort((a, b) => a.user_lvl < b.user_lvl ? 1 : -1);
}

function unique(arr) {
    let result = [];

    for (let str of arr) {
        if (!result.includes(str)) {
            result.push(str);
        }
    }
    return result;
}
