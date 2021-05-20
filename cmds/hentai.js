var moduleName = "Hentai";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class Hentai {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.Database = Database;
        this.lng = Utils.lng;
        this.Utils = Utils;
        this.Client = Client;
    }
    execute = function (message) {
        var othis = this;
        this.Database.getUserByDiscordID(message.author.id, function (user) {
            if (!user.hent_uses){
                user.hent_uses = {
                    last: 0,
                    count: 0,
                }
            }
            var curTS = new Date().getTime() / 1000;
            if((curTS - user.hent_uses.last) >= 43200){
                user.hent_uses.count = 0;
            }
            if (user.user_group === "VIP" || user.user_group === "Admin" || user.user_group === "hentmod" || user.hent_uses.count <= 5) {
                if (message.channel.nsfw) {
                    var args = message.content.split(" ");
                        othis.Database.getLastHentai(function (hentCount) {
                            var hent;
                            if (args[1]) {
                                if (args[1] === "list") {
                                    if (user.user_group === "Admin" || user.user_group === "hentmod") {
                                        var page = 1;
                                        if (args[2]) {
                                            if (isNaN(parseInt(args[2]))) {
                                                page = 1;
                                            } else {
                                                page = parseInt(args[2]);
                                            }
                                        } else {
                                            page = 1;
                                        }
                                        if (page > Math.floor(hentCount / 10) + 1) {
                                            message.channel.send(othis.lng.hentai.pageNotExist[user.lang]);
                                            return
                                        }
                                        var i;
                                        if (page <= 1) {
                                            i = 1;
                                        } else {
                                            i = (page * 10) - 10
                                        }
                                        var c = page * 10;
                                        var out = "";
                                        othis.Database.getHentaiRange(i, i+10, function (hents) {
                                            var j = 0;
                                            while (j < 10) {
                                                var hentai = hents[j];
                                                if (!hentai) {
                                                    out = `${out}\n**${i + j}.** ${'`'}${othis.lng.hentai.empty[user.lang]}${'`'}\n`;
                                                } else {
                                                    out = `${out}\n**${i + j}.** ${hentai.url}\n${hentai.user} :id:${hentai.num}ᅠᅠ:eye:${hentai.views}ᅠᅠ:heart:${hentai.likes}\n`;
                                                }
                                                j++;
                                            }
                                            var embd = new othis.Discord.MessageEmbed()
                                                .setColor(0x8b00ff)
                                                .setTitle(`${othis.lng.hentai.page[user.lang]} ${page}/${Math.floor(hentCount / 10) + 1}`)
                                                .setDescription(out);
                                            message.channel.send(embd);
                                            othis.Database.writeLog('hentai', message.author.id, message.guild.name,
                                                JSON.stringify({
                                                    Message: `User '${message.author.tag}' watched '${page}' page of hentai list.`
                                            }));
                                            return;
                                        });
                                    } else {
                                        message.channel.send(othis.lng.hentai.youAreNotAdmin[user.lang]);
                                        return;
                                    }
                                } else if (args[1] === "add") {
                                    if (user.user_group === "Admin" || user.user_group === "hentmod") {
                                        var hurl;
                                        if (!args[2]) {
                                            message.channel.send(othis.lng.hentai.noLink[user.lang]);
                                            return;
                                        } else {
                                            hurl = args[2];
                                        }
                                        othis.Database.getHentaiNums(function (nums) {
                                            console.log(nums);
                                            var i = 0;
                                            var emptyIndex;
                                            while (i < hentCount) {
                                                console.log(parseInt(nums[i]), i + 1);
                                                if (!(parseInt(nums[i]) === i + 1)) {
                                                    emptyIndex = i + 1;
                                                    break;
                                                }
                                                i++;
                                            }
                                            if (!emptyIndex) {
                                                emptyIndex = hentCount + 1;
                                            }
                                            var newHent = {
                                                num: emptyIndex,
                                                url: hurl,
                                                author: user.user
                                            };
                                            othis.Database.addHentai(newHent, function() {
                                                message.channel.send(`${othis.lng.hentai.picAddedAt[user.lang]} **${emptyIndex}**!`);
                                                othis.Database.writeLog('hentai', message.author.id, message.guild.name,
                                                    JSON.stringify({
                                                        Message: `User '${message.author.tag}' added hentai picture with id '${newHent.num}' and url '${newHent.url}'.`
                                                }));
                                                return;
                                            });
                                        });
                                    } else {
                                        message.channel.send(othis.lng.hentai.youAreNotAdmin[user.lang]);
                                        return;
                                    }

                                } else if (args[1] === "rm") {
                                    if (user.user_group === "Admin" || user.user_group === "hentmod") {
                                        var nhent;
                                        if (args[2]) {
                                            if (isNaN(parseInt(args[2]))) {
                                                message.channel.send(othis.lng.hentai.picNotExist[user.lang]);
                                                return;
                                            } else {
                                                nhent = parseInt(args[2]);
                                            }
                                        } else {
                                            message.channel.send(othis.lng.hentai.noPic[user.lang]);
                                            return;
                                        }
                                        othis.Database.delHentai(nhent,function () {
                                            message.channel.send(`${othis.lng.hentai.picAtNum[user.lang]} **${nhent}** ${othis.lng.hentai.deleted[user.lang]}!`);
                                            othis.Database.writeLog('hentai', message.author.id, message.guild.name,
                                                JSON.stringify({
                                                    Message: `User '${message.author.tag}' deleted hentai picture with id '${nhent}'.`
                                            }));
                                            return;
                                        });
                                    } else {
                                        message.channel.send(othis.lng.hentai.youAreNotAdmin[user.lang]);
                                        return;
                                    }
                                } else if (args[1] === "offer") {
                                    if (user.user_group === "Admin" || user.user_group === "hentmod" || user.user_group === "VIP") {
                                        var hurl;
                                        if (!args[2]) {
                                            message.channel.send(othis.lng.hentai.noLink[user.lang]);
                                            return;
                                        } else {
                                            hurl = args[2];
                                        }
                                        var embd = new othis.Discord.MessageEmbed()
                                            .setTitle(`User: ${message.author.tag}\nUserID: ${message.author.id}\nPicURL: ${hurl}\nPic:`)
                                            .setColor(0x277353)
                                            .setImage(hurl);
                                        othis.Client.users.cache.get('508637328349331462').send(embd);
                                        message.channel.send(othis.lng.hentai.picOffered[user.lang]);
                                        othis.Database.writeLog('hentai', message.author.id, message.guild.name,
                                            JSON.stringify({
                                                Message: `User '${message.author.tag}' offered hentai picture with url '${hurl}'.`
                                        }));
                                        return;
                                    }
                                } else if (args[1] === "like") {
                                    if (user.user_group === "Admin" || user.user_group === "hentmod" || user.user_group === "VIP") {
                                        var nhent;
                                        if (args[2]) {
                                            if (isNaN(parseInt(args[2]))) {
                                                message.channel.send(othis.lng.hentai.picNotExist[user.lang]);
                                                return;
                                            } else {
                                                nhent = parseInt(args[2]);
                                            }
                                        } else {
                                            message.channel.send(othis.lng.hentai.noPic[user.lang]);
                                            return;
                                        }
                                        othis.Database.getHentaiPicture(nhent, function (xent) {
                                            xent.likes++;
                                            othis.Database.updateHentai(xent.id, xent, function () {
                                                message.channel.send(`${othis.lng.hentai.youLiked[user.lang]} **${nhent}**!`);
                                                return;
                                            });
                                            othis.Database.writeLog('hentai', message.author.id, message.guild.name,
                                                JSON.stringify({
                                                    Message: `User '${message.author.tag}' liked hentai picture with id '${nhent.num}' and url '${nhent.url}'.`
                                            }));
                                        });
                                    }
                                } else if (args[1] === "stats") {
                                    if (user.user_group === "Admin" || user.user_group === "hentmod" || user.user_group === "VIP") {
                                        othis.Database.getHentaiStats(function (stats) {
                                            var embd = new othis.Discord.MessageEmbed()
                                                .setColor(0x8b00ff)
                                                .setTitle("Статистика команды !hentai:")
                                                .addFields([
                                                    { name: `${othis.lng.hentai.totalLikes[user.lang]}: `, value:
                                                            `${stats.likes} :heart:` },

                                                    { name: `${othis.lng.hentai.totalViews[user.lang]}: `, value:
                                                            `${stats.views} :eye:` },

                                                    { name: `${othis.lng.hentai.picsCount[user.lang]}: `, value:
                                                            `${hentCount} :frame_photo:` },

                                                    { name: `${othis.lng.hentai.mostPopular[user.lang]}: `, value:
                                                        `${othis.lng.hentai.byLikes[user.lang]}: :id:${stats.maxLikes.num}ᅠ:eye:${stats.maxLikes.views}ᅠ:heart:${stats.maxLikes.likes}\n
                                                        ${othis.lng.hentai.byViews[user.lang]}: :id:${stats.maxViews.num}ᅠ:eye:${stats.maxViews.views}ᅠ:heart:${stats.maxViews.likes}` },
                                                ]);
                                            message.channel.send(embd);
                                            othis.Database.writeLog('hentai', message.author.id, message.guild.name,
                                                JSON.stringify({
                                                    Message: `User '${message.author.tag}' watched hentai stats.`
                                            }));
                                            return;
                                        });
                                    }
                                }else if (isNaN(parseInt(args[1]))) {
                                    message.channel.send(othis.lng.hentai.picNotExist[user.lang]);
                                    return;
                                } else {
                                    othis.Database.getHentaiPicture(parseInt(args[1]), function (hent) {
                                        if (!(hent)) {
                                            message.channel.send(lng.hentai.picNotExist[user.lang]);
                                            return;
                                        } else {
                                            var emb = new othis.Discord.MessageEmbed()
                                                .setDescription(`:id:${hent.num}ᅠᅠ:eye:${hent.views}ᅠᅠ:heart:${hent.likes}`)
                                                .setImage(hent.url)
                                                .setColor(0x8b00ff);
                                            hent.views++;
                                            othis.Database.updateHentai(hent.num, hent, function () {
                                                user.hent_uses.count++;
                                                user.hent_uses.last = curTS;
                                                othis.Database.updateUser(user.discord_id, user, function(){
                                                    message.channel.send(emb);
                                                    othis.Database.writeLog('hentai', message.author.id, message.guild.name,
                                                        JSON.stringify({
                                                            Message: `User '${message.author.tag}' watched hentai picture with id '${hent.num}' and url '${hent.url}'.`
                                                    }));
                                                    return;
                                                });
                                            });
                                        }
                                    });
                                }
                            } else {
                                othis.Database.getHentaiPicture(othis.Utils.getRandomInt(hentCount)+1, function (hent) {
                                    var emb = new othis.Discord.MessageEmbed()
                                        .setDescription(`:id:${hent.num}ᅠᅠ:eye:${hent.views}ᅠᅠ:heart:${hent.likes}`)
                                        .setImage(hent.url)
                                        .setColor(0x8b00ff);
                                    hent.views++;
                                    othis.Database.updateHentai(hent.num, hent, function () {
                                        user.hent_uses.count++;
                                        user.hent_uses.last = curTS;
                                        othis.Database.updateUser(user.discord_id, user, function(){
                                            message.channel.send(emb);
                                            othis.Database.writeLog('hentai', message.author.id, message.guild.name,
                                                JSON.stringify({
                                                    Message: `User '${message.author.tag}' watched hentai picture with id '${hent.num}' and url '${hent.url}'.`
                                            }));
                                            return;
                                        });
                                    });
                                });
                            }
                        });
                } else {
                    message.channel.send(othis.lng.hentai.notNSFW[user.lang]);
                    return;
                }

            } else {
                message.channel.send(othis.lng.hentai.notVIP[user.lang]);
                return;
            }
        });
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = Hentai;

