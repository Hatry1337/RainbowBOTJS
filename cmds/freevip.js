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
                    vip_void = othis.Utils.timeConversion((parseInt(user.vip_time - cur_ts)) * 1000, othis.lng, user.lang);
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
