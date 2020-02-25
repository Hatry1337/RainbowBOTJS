console.log("Imported randcat");

function randcat(message, Discord, request) {
    request('https://api.thecatapi.com/v1/images/search?size=full', function (error, response, body) {
        var data = JSON.parse(body);

        emb = new Discord.MessageEmbed()
            .setColor(0x6495ed)
            .setTitle("Random Cat")
            .setImage(data[0].url);
        message.channel.send(emb);
        return;
    });

}
