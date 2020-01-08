console.log("Imported hentai");

function hentai(message, client, Discord, fs, db, gu) {
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
        if (user.user_group === "VIP" || user.user_group === "Admin") {
            if (message.channel.nsfw) {
                var args = message.content.split(" ");
                db.all("SELECT * FROM hentai", [], (err, rows) => {
                    if (err) {
                        throw err;
                    }
                    var hent;
                    if (args[1]) {
                        if (isNaN(parseInt(args[1]))) {
                            message.channel.send("invalid picture id");
                            return;
                        } else {
                            console.log(parseInt(args[1]));
                            getHentai(parseInt(args[1]), function (hentai) {
                                hent = hentai;
                                if (!(hent)) {
                                    message.channel.send("Такой картинки не существует!");
                                    return;
                                } else {
                                    console.log(hent.toString());
                                    emb = new Discord.RichEmbed()
                                        .setDescription(`:id:${hent.num}ᅠᅠ:eye:${hent.views}ᅠᅠ:heart:${hent.likes}`)
                                        .setImage(hent.url)
                                        .setColor(0x8b00ff);

                                    message.channel.send(embed = emb);
                                    return;
                                }
                            });
                        }
                    } else {
                        hent = rows[getRandomInt(rows.length) + 1];
                        console.log(hent.toString());
                        emb = new Discord.RichEmbed()
                            .setDescription(`:id:${hent.num}ᅠᅠ:eye:${hent.views}ᅠᅠ:heart:${hent.likes}`)
                            .setImage(hent.url)
                            .setColor(0x8b00ff);

                        message.channel.send(embed = emb);
                        return;
                    }
                });
            } else {
                message.channel.send("Вы не в NSFW канале!");
                return;
            }

        } else {
            message.channel.send("Для просмотра хентая нужна группа VIP");
            return;
        }
    });

}



function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
