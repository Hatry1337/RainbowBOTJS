console.log("Imported freevip");
function freevip(message, Discord, db, client, gu, uu, dbl, lng) {
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

    gu(message.author.id, function (user) {
        var cur_ts = new Date().getTime() / 1000;
        if (user.user_group === "VIP") {
            var vip_void;
            if (user.vip_time === "inf") {
                vip_void = lng.freevip.notExp[user.lang];
            } else {
                vip_void = timeConversion((parseInt(user.vip_time - cur_ts)) * 1000, lng, user.lang);
            }
            message.channel.send(`${lng.freevip.vipAlredyExist[user.lang]} ${vip_void}`);
            return;
        } else {
            dbl.hasVoted(message.author.id).then(isVoted => {
                if (!(isVoted)) {
                    message.channel.send(`${lng.freevip.forVip[user.lang]}${lng.freevip.noVote[user.lang]}`);
                    console.log(isVoted);
                    return;
                } else {
                    message.channel.send(`${lng.freevip.forVip[user.lang]}${lng.freevip.yesVote[user.lang]}`);
                    console.log(isVoted);
                    if (isVoted) {
                        var vip_time = cur_ts + 43200;
                        user.vip_time = vip_time;
                        user.user_group = "VIP";
                        user.user_points = user.user_points + 30000;
                        uu(message.author.id, user, function () {
                            message.channel.send(lng.freevip.youGotVIP[user.lang]);
                            return;
                        });
                    }
                }
            });
        }
    });
}

