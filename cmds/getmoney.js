var moduleName = "GetMoney";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class GetMoney {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
        this.Utils = Utils;
    }

    fuckUpReason = function(lang){
        return this.Utils.arrayRandElement(this.Utils.lng.getmoney.fckupReasons[lang]);
    }

    execute = async function (message, pipef) {
        var othis = this;
        this.Database.getUserByDiscordID(message.author.id, async function (user) {
            if (user.bm1_time === 0) {
                user.bm1_time = new Date().getTime() / 1000;
                othis.Database.updateUser(user.discord_id, user, async function () {
                    if(pipef){
                        await pipef(othis.Utils.lng.getmoney.miningstart[user.lang]);
                    }
                    return message.channel.send(othis.Utils.lng.getmoney.miningstart[user.lang]);
                });
            } else {
                var curTS = new Date().getTime() / 1000;
                var diff = curTS - user.bm1_time;
                var bm1_rate = 1.2;
                var bm2_rate = 2.5;
                var bmr_rate = 5.6;
                var bmdc_rate = 27.8;
                var ss_rate = 2.8;
                var ss_xp_rate = 0.006;

                var total_points =
                    (bm1_rate * diff) * user.bitminer1 +
                    (bm2_rate * diff) * user.bitminer2 +
                    (bmr_rate * diff) * user.bitminer_rack +
                    (bmdc_rate * diff) * user.bitm_dc +
                    (ss_rate * diff) * user.solar_station;

                var total_xp =
                    (ss_xp_rate * diff) * user.solar_station;

                total_points = Math.floor(total_points);
                total_xp = Math.floor(total_xp);



                user.user_points = user.user_points + total_points;
                user.user_xp = user.user_xp + total_xp;

                //miners fuckup feature here:
                var mfckup_txt = undefined;

                if(Math.random() > 0.9){
                    var fckup_bm1  = othis.Utils.getRandomInt(Math.floor(user.bitminer1 / 2));
                    user.bitminer1 -= fckup_bm1;
                    mfckup_txt = !mfckup_txt ? `${othis.fuckUpReason(user.lang)}\n` : ``;
                    mfckup_txt += `\`Bitminer S1: ${fckup_bm1}\`\n`;
                }

                if(Math.random() > 0.9){
                    var fckup_bm2  = othis.Utils.getRandomInt(Math.floor(user.bitminer2 / 2));
                    user.bitminer2 -= fckup_bm2;
                    mfckup_txt = !mfckup_txt ? `${othis.fuckUpReason(user.lang)}\n` : ``;
                    mfckup_txt += `\`Bitminer S2: ${fckup_bm2}\`\n`;
                }

                if(Math.random() > 0.9){
                    var fckup_bmr  = othis.Utils.getRandomInt(Math.floor(user.bitminer_rack / 2));
                    user.bitminer_rack -= fckup_bmr;
                    mfckup_txt = !mfckup_txt ? `${othis.fuckUpReason(user.lang)}\n` : ``;
                    mfckup_txt += `\`Bitminer Rack: ${fckup_bmr}\`\n`;
                }

                if(Math.random() > 0.9){
                    var fckup_bmdc = othis.Utils.getRandomInt(Math.floor(user.bitm_dc / 2));
                    user.bitm_dc -= fckup_bmdc;
                    mfckup_txt = !mfckup_txt ? `${othis.fuckUpReason(user.lang)}\n` : ``;
                    mfckup_txt += `\`Bitminer DataCenter: ${fckup_bmdc}\`\n`;
                }

                //electricity bill feature:
                var power = (bm1_rate  * 0.2 * diff)       * user.bitminer1      +
                            (bm2_rate  * 0.2 * diff)       * user.bitminer2      +
                            (bmr_rate  * 0.2 * diff)       * user.bitminer_rack  +
                            (bmdc_rate * 0.2 * diff)       * user.bitm_dc        ;

                var p_cost = power * 0.3;
                user.user_points -= p_cost;


                
                var msg_txt =   `${othis.Utils.lng.getmoney.income[user.lang]} ${othis.Utils.timeConversion(diff * 1000, user.lang)}: ` +
                                `${total_points.toReadable()} ${othis.Utils.lng.getmoney.points[user.lang]}; ` +
                                `${total_xp !== 0 ? `${total_xp} xp;` : ``}` +
                                `\n\`${othis.Utils.lng.getmoney.electricity[user.lang]}: -${Math.floor(p_cost).toReadable()} ${othis.Utils.lng.getmoney.points[user.lang]};\`` +
                                `${mfckup_txt ? `\n\n${mfckup_txt}`: ``}`;


                if(pipef){
                    await pipef(msg_txt);
                }else {
                    await message.channel.send(msg_txt);
                }

                othis.Database.writeLog('Getmoney', message.author.id, message.guild.name,
                    JSON.stringify({
                        Message: `User '${message.author.tag}' getted ${total_points} points, and ${total_xp} xp.`
                }));
                
                user.bm1_time = new Date().getTime() / 1000;
                othis.Database.updateUser(user.discord_id, user, function () {
                    return;
                });
            }
        });
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = GetMoney;
