var moduleName = "FreeVIP";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class FreeVIP {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
        this.Utils = Utils;
        this.lng = Utils.lng;
    }
    execute = function (message) {
        var othis = this;
        this.Database.getUserByDiscordID(message.author.id, function (user) {
            var cur_ts = new Date().getTime() / 1000;
            if (user.user_group === "VIP") {
                var vip_void;
                if (user.vip_time === "inf") {
                    vip_void = othis.lng.freevip.notExp[user.lang];
                } else {
                    vip_void = othis.Utils.timeConversion((Math.floor(user.vip_time - cur_ts)) * 1000, user.lang);
                }
                return message.channel.send(`${othis.lng.freevip.vipAlredyExist[user.lang]} ${vip_void}`);
            } else {
                othis.Utils.dbl.hasVoted(message.author.id).then(isVoted => {
                    if (!(isVoted)) {
                        message.channel.send(`${othis.lng.freevip.forVip[user.lang]}${othis.lng.freevip.noVote[user.lang]}${"```"}`);
                        console.log(isVoted);
                        return;
                    } else {
                        message.channel.send(`${othis.lng.freevip.forVip[user.lang]}${othis.lng.freevip.yesVote[user.lang]}${"```"}`);
                        console.log(isVoted);
                        if (isVoted) {
                            var vip_time = cur_ts + 43200;
                            user.vip_time = vip_time;
                            user.user_group = "VIP";
                            user.user_points = user.user_points + 30000;
                            othis.Database.updateUser(message.author.id, user, function () {
                                message.channel.send(othis.lng.freevip.youGotVIP[user.lang]);
                                return;
                            });
                            othis.Database.writeLog('freevip', message.author.id, message.guild.name,
                                JSON.stringify({
                                    Message: `User '${message.author.tag}' taked FreeVIP and 30.000 points.`
                            }));
                        }
                    }
                });
            }
        });
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = FreeVIP;
