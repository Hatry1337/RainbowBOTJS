console.log("Imported roll");

function roll(message, Discord) {
    var args = message.content.split(" ");
    var max_r = 100;
    if (args[1]) {
        if (!(isNaN(parseInt(args[1])))) {
            if (isFinite(parseInt(args[1]))) {
                max_r = parseInt(args[1]);
            }
        }
    }

    var rand = Math.floor(Math.random() * max_r);
    emb = new Discord.RichEmbed()
        .setColor(0x6495ed)
        .setTitle(`Выпало число ${rand} из ${max_r}`);

    message.channel.send(emb);
    return;
}
