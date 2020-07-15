var moduleName = "Top";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class Top {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
    }
    sortUsersByPoints = async function (arr) {
        return arr.sort((a, b) => a.user_points > b.user_points ? -1 : 1);
    };
    sortUsersByLvl = async function (arr) {
        return arr.sort((a, b) => a.user_lvl.user_lvl ? -1 : 1);
    };

    execute = async function (message) {
        var othis = this;
        this.Database.getAllUsers(async function (users) {
            var usersByPoints = await othis.sortUsersByPoints(users);
            var curUserPlace = usersByPoints.findIndex(x => x.discord_id === message.author.id);
            var emb = new othis.Discord.MessageEmbed()
                .setColor(0x8b00ff)
                .setTitle(`Топ игроков по Поинтам`)
                .setDescription(
                    `:one: **${usersByPoints[0].user}** - _${parseInt(usersByPoints[0].user_points)}_ поинтов\n`+
                    `:two: **${usersByPoints[1].user}** - _${parseInt(usersByPoints[1].user_points)}_ поинтов\n`+
                    `:three: **${usersByPoints[2].user}** - _${parseInt(usersByPoints[2].user_points)}_ поинтов\n`+
                    `:four: **${usersByPoints[3].user}** - _${parseInt(usersByPoints[3].user_points)}_ поинтов\n`+
                    `:five: **${usersByPoints[4].user}** - _${parseInt(usersByPoints[4].user_points)}_ поинтов\n`+
                    `:six: **${usersByPoints[5].user}** - _${parseInt(usersByPoints[5].user_points)}_ поинтов\n`+
                    `:seven: **${usersByPoints[6].user}** - _${parseInt(usersByPoints[6].user_points)}_ поинтов\n`+
                    `:eight: **${usersByPoints[7].user}** - _${parseInt(usersByPoints[7].user_points)}_ поинтов\n`+
                    `:nine: **${usersByPoints[8].user}** - _${parseInt(usersByPoints[8].user_points)}_ поинтов\n`+
                    `:keycap_ten: **${usersByPoints[9].user}** - _${parseInt(usersByPoints[9].user_points)}_ поинтов\n`+
                    `\nВы на ${curUserPlace + 1} месте.`
                );
            message.channel.send(emb);
        });
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Top;
