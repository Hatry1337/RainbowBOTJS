﻿console.log("Imported hentai");

function hentai(message, client, Discord, fs, db, gu, uu, lng) {
    function getHentai(localID, done) {
        db.all(`SELECT * FROM hentai WHERE num = ${localID}`, [], (err, rows) => {
            if (err) {
                throw err;
            }
            var hent = rows[0];
            done(hent);
            return hent;
        });
    }
    gu(message.author.id, function (user) {
        if (user.hent_uses) {
            console.log("sucking from db")
            user.hent_uses = JSON.parse(user.hent_uses);
        } else {
            console.log("GOVNO");
            user.hent_uses = {
                last: 0,
                count: 0,
            }
        }
        var curTS = new Date().getTime() / 1000;
        if((curTS - user.hent_uses.last) >= 43200){
            console.log(curTS - user.hent_uses.last);
            user.hent_uses.count = 0;
            console.log("Setting 0 govna");
        }
        if (user.user_group === "VIP" || user.user_group === "Admin" || user.user_group === "hentmod" || user.hent_uses.count <= 5) {
            if (message.channel.nsfw) {
                var args = message.content.split(" "); 
                db.all("SELECT * FROM hentai", [], (err, rows) => {
                    if (err) {
                        throw err;
                    }
                    db.all("SELECT MAX(num) FROM hentai", [], (err, hentCount) => {
                        if (err) {
                            throw err;
                        }
                        hentCount = hentCount[0]['MAX(num)'];
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
                                        message.channel.send(lng.hentai.pageNotExist[user.lang]);
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
                                    getHentai(i, function (h1) {
                                        getHentai(i + 1, function (h2) {
                                            getHentai(i + 2, function (h3) {
                                                getHentai(i + 3, function (h4) {
                                                    getHentai(i + 4, function (h5) {
                                                        getHentai(i + 5, function (h6) {
                                                            getHentai(i + 6, function (h7) {
                                                                getHentai(i + 7, function (h8) {
                                                                    getHentai(i + 8, function (h9) {
                                                                        getHentai(i + 9, function (h10) {
                                                                            var hents = [h1, h2, h3, h4, h5, h6, h7, h8, h9, h10];
                                                                            var j = 0;
                                                                            while (j < 10) {
                                                                                var hentai = hents[j];
                                                                                if (!hentai) {
                                                                                    out = `${out}\n**${i + j}.** ${'`'}${lng.hentai.empty[user.lang]}${'`'}\n`;
                                                                                } else {
                                                                                    out = `${out}\n**${i + j}.** ${hentai.url}\n${hentai.user} :id:${hentai.num}ᅠᅠ:eye:${hentai.views}ᅠᅠ:heart:${hentai.likes}\n`;
                                                                                }
                                                                                j++;
                                                                            }
                                                                            var embd = new Discord.MessageEmbed()
                                                                                .setColor(0x8b00ff)
                                                                                .setTitle(`${lng.hentai.page[user.lang]} ${page}/${Math.floor(hentCount / 10) + 1}`)
                                                                                .setDescription(out);
                                                                            message.channel.send(embd);
                                                                            return;
                                                                        });
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });

                                } else {
                                    message.channel.send(lng.hentai.youAreNotAdmin[user.lang]);
                                    return;
                                }
                            } else if (args[1] === "add") {
                                if (user.user_group === "Admin" || user.user_group === "hentmod") {
                                    var hurl;
                                    if (!args[2]) {
                                        message.channel.send(lng.hentai.noLink[user.lang]);
                                        return;
                                    } else {
                                        hurl = args[2];
                                    }
                                    db.all("SELECT group_concat(num, '_') FROM hentai", [], (err, nums) => {
                                        if (err) {
                                            throw err;
                                        }
                                        nums = nums[0]["group_concat(num, '_')"].split("_").sort(function (a, b) { return a - b });
                                        console.log(nums)
                                        var i = 0;
                                        var emptyIndex;
                                        while (i < hentCount) {
                                            console.log(parseInt(nums[i]), i + 1)
                                            if (!(parseInt(nums[i]) == i + 1)) {
                                                emptyIndex = i + 1;
                                                break;
                                            }
                                            i++;
                                        }
                                        if (!emptyIndex) {
                                            emptyIndex = hentCount + 1;
                                        }

                                        db.run(`INSERT INTO hentai(num,url,views,likes,user) VALUES(?, ?, ?, ?, ?)`, [emptyIndex, hurl, 0, 0, user.user], function (err) {
                                            if (err) {
                                                return console.log(err.message);
                                            }
                                            message.channel.send(`${lng.hentai.picAddedAt[user.lang]} **${emptyIndex}**!`);
                                            return;
                                        });

                                    });
                                } else {
                                    message.channel.send(lng.hentai.youAreNotAdmin[user.lang]);
                                    return;
                                }

                            } else if (args[1] === "rm") {
                                if (user.user_group === "Admin" || user.user_group === "hentmod") {
                                    var nhent;
                                    if (args[2]) {
                                        if (isNaN(parseInt(args[2]))) {
                                            message.channel.send(lng.hentai.picNotExist[user.lang]);
                                            return;
                                        } else {
                                            nhent = parseInt(args[2]);
                                        }
                                    } else {
                                        message.channel.send(lng.hentai.noPic[user.lang]);
                                        return;
                                    }
                                    db.run(`DELETE FROM hentai WHERE num = ?`, [nhent], function (err) {
                                        if (err) {
                                            return console.log(err.message);
                                        }
                                        message.channel.send(`${lng.hentai.picAtNum[user.lang]} **${nhent}** ${lng.deleted[user.lang]}!`);
                                        return;
                                    });

                                } else {
                                    message.channel.send(lng.hentai.youAreNotAdmin[user.lang]);
                                    return;
                                }
                            } else if (args[1] === "offer") {
                                if (user.user_group === "Admin" || user.user_group === "hentmod" || user.user_group === "VIP") {
                                    var hurl;
                                    if (!args[2]) {
                                        message.channel.send(lng.hentai.noLink[user.lang]);
                                        return;
                                    } else {
                                        hurl = args[2];
                                    }
                                    var embd = new Discord.MessageEmbed()
                                        .setTitle(`User: ${message.author.tag}\nUserID: ${message.author.id}\nPicURL: ${hurl}\nPic:`)
                                        .setColor(0x277353)
                                        .setImage(hurl);
                                    client.users.cache.get('508637328349331462').send(embd);
                                    message.channel.send(lng.hentai.picOffered[user.lang]);
                                    return;
                                }
                            } else if (args[1] === "like") {
                                if (user.user_group === "Admin" || user.user_group === "hentmod" || user.user_group === "VIP") {
                                    var nhent;
                                    if (args[2]) {
                                        if (isNaN(parseInt(args[2]))) {
                                            message.channel.send(lng.hentai.picNotExist[user.lang]);
                                            return;
                                        } else {
                                            nhent = parseInt(args[2]);
                                        }
                                    } else {
                                        message.channel.send(lng.hentai.noPic[user.lang]);
                                        return;
                                    }
                                    getHentai(nhent, function (xent) {
                                        db.run(`UPDATE hentai SET likes = ? WHERE num = ?`, [xent.likes + 1, nhent], function (err) {
                                            if (err) {
                                                return console.log(err.message);
                                            }
                                            message.channel.send(`${lng.hentai.youLiked[user.lang]} **${nhent}**!`);
                                            return;
                                        });
                                    });
                                }
                            } else if (args[1] === "stats") {
                                if (user.user_group === "Admin" || user.user_group === "hentmod" || user.user_group === "VIP") {
                                    db.all("SELECT SUM(likes) FROM hentai", [], (err, likes) => {
                                        if (err) {
                                            throw err;
                                        }
                                        db.all("SELECT SUM(views) FROM hentai", [], (err, views) => {
                                            if (err) {
                                                throw err;
                                            }
                                            db.all("SELECT * FROM hentai WHERE likes = (SELECT MAX(likes) FROM hentai)", [], (err, maxLikes) => {
                                                if (err) {
                                                    throw err;
                                                }
                                                db.all("SELECT * FROM hentai WHERE views = (SELECT MAX(views) FROM hentai)", [], (err, maxViews) => {
                                                    if (err) {
                                                        throw err;
                                                    }
                                                    var embd = new Discord.MessageEmbed()
                                                        .setColor(0x8b00ff)
                                                        .setTitle("Статистика команды !hentai:")
                                                        .addFields([
                                                            { name: `${lng.hentai.totalLikes[user.lang]}: `, value: `${likes[0]['SUM(likes)']} :heart:` },
                                                            { name: `${lng.hentai.totalViews[user.lang]}: `, value: `${views[0]['SUM(views)']} :eye:` },
                                                            { name: `${lng.hentai.picsCount[user.lang]}: `, value: `${hentCount} :frame_photo:` },
                                                            { name: `${lng.hentai.mostPopular[user.lang]}: `, value: `${lng.hentai.byLikes[user.lang]}: :id:${maxLikes[0].num}ᅠ:eye:${maxLikes[0].views}ᅠ:heart:${maxLikes[0].likes}\n\n${lng.hentai.byViews[user.lang]}: :id:${maxViews[0].num}ᅠ:eye:${maxViews[0].views}ᅠ:heart:${maxViews[0].likes}` },


                                                        ]);
                                                    message.channel.send(embd);
                                                    return;
                                                });
                                            });
                                        });
                                    });

                                }
                            }else if (isNaN(parseInt(args[1]))) {
                                message.channel.send(lng.hentai.picNotExist[user.lang]);
                                return;

                                //NORMAL HENTAI CMD HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                            } else {
                                getHentai(parseInt(args[1]), function (hentai) {
                                    hent = hentai;
                                    if (!(hent)) {
                                        message.channel.send(lng.hentai.picNotExist[user.lang]);
                                        return;
                                    } else {
                                        var emb = new Discord.MessageEmbed()
                                            .setDescription(`:id:${hent.num}ᅠᅠ:eye:${hent.views}ᅠᅠ:heart:${hent.likes}`)
                                            .setImage(hent.url)
                                            .setColor(0x8b00ff);
                                        db.run(`UPDATE hentai SET views = ? WHERE num = ?`, [hent.views + 1, hent.num], function (err) {
                                            if (err) {
                                                return console.log(err.message);
                                            }
                                            user.hent_uses.count++;
                                            user.hent_uses.last = curTS;
                                            console.log(JSON.stringify(user.hent_uses));
                                            user.hent_uses = JSON.stringify(user.hent_uses);
                                            uu(user.user_id, user, function(){
                                                if (err) {
                                                    return console.log(err.message);
                                                }
                                                message.channel.send(embed = emb);
                                                return;
                                            });
                                        });
                                    }
                                });
                            }
                        } else {
                            hent = rows[getRandomInt(rows.length) + 1];
                            emb = new Discord.MessageEmbed()
                                .setDescription(`:id:${hent.num}ᅠᅠ:eye:${hent.views}ᅠᅠ:heart:${hent.likes}`)
                                .setImage(hent.url)
                                .setColor(0x8b00ff);
                            db.run(`UPDATE hentai SET views = ? WHERE num = ?`, [hent.views + 1, hent.num], function (err) {
                                if (err) {
                                    return console.log(err.message);
                                }
                                user.hent_uses.count++;
                                user.hent_uses.last = curTS;
                                console.log(JSON.stringify(user.hent_uses));
                                user.hent_uses = JSON.stringify(user.hent_uses);
                                uu(message.author.id, user, function(){
                                    if (err) {
                                        return console.log(err.message);
                                    }
                                    message.channel.send(embed = emb);
                                    return;
                                });
                            });
                        }
                    });
                });
            } else {
                message.channel.send(lng.hentai.notNSFW[user.lang]);
                return;
            }

        } else {
            message.channel.send(lng.hentai.notVIP[user.lang]);
            return;
        }
    });

}



function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
