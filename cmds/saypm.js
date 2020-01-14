console.log("Imported saypm");
function saypm(message, Discord, db, client, gu, uu) {
    var args = message.content.split(" ");
    var uid = args[1];
    var toUserMsg = message.content.slice(8 + uid.length);
    if (!(uid)) {
        message.channel.send("Error: Invalid Syntax\n```!saypm <user> <message>\n\n<user>: @user or id\n<message>: any```");
        return;
    }
    if (uid) {
        var uarg = uid.toString();
        uarg = uarg.replace("<@!", "");
        uarg = uarg.replace(">", "");
        uid = uarg;
    } else {
        return;
    }
    if (isNaN(parseInt(uid))) {
        message.channel.send("Введен неверный ID!");
        return;
    }

    client.users.get(uid).send(`[Admin]${message.author.tag}: ${toUserMsg}`);
    message.channel.send(`Сообщение "${toUserMsg}" было отправлено пользователю ${client.users.get(uid).tag}`);
}
