console.log("Imported rep");

function rep(message, Discord, client) {
    var question = message.content.slice(5);

    if (!(question)) {
        message.channel.send("Вы не ввели сообщение!");
        return;
    }

    client.users.get('508637328349331462').send(`[${message.author.id}]${message.author.tag}: ${question}`);
    message.channel.send(`Сообщение "${question}" было отправлено Администратору!`);
}
