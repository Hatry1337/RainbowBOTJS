console.log("Imported hentai");

function hentai(message, client, Discord, fs, db, gu) {
    gu(message.author.id, function (user) {
        if (user.user_group === "VIP") {
            if (message.channel.nsfw) {
                db.all("SELECT * FROM hentai", [], (err, rows) => {
                    if (err) {
                        throw err;
                    }
                    hent = rows[getRandomInt(rows.length) + 1];
                    console.log(hent.toString());
                    emb = new Discord.RichEmbed()
                        .setDescription(`:id:${hent.num}ᅠᅠ:eye:${hent.views}ᅠᅠ:heart:${hent.likes}`)
                        .setImage(hent.url)
                        .setColor(0x8b00ff);

                    message.channel.send(embed = emb);
                });
            } else {
                message.channel.send("Вы не в NSFW канале!");
            }

        } else {
            message.channel.send("Для просмотра хентая нужна группа VIP");
        }
    });
}


function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}