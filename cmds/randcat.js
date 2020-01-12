console.log("Imported randcat");

function randcat(message, Discord, request) {
    request('http://aws.random.cat/meow', function (error, response, body) {
        var data = JSON.parse(body);

        emb = new Discord.RichEmbed()
            .setColor(0x6495ed)
            .setTitle("Random Cat")
            .setImage(data.file);
        message.channel.send(emb);
        return;
    });

}
