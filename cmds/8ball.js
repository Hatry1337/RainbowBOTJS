﻿console.log("Imported 8ball");

function ball8(message, Discord) {
    var question = message.content.slice(7);

    if (!(question)) {
        message.channel.send("Вы не ввели вопрос!");
        return;
    }
    var answs = [
        "Думаю да.",
        "Скорее всего нет.",
        "Определенно да.",
        "Однозначно нет.",
        "Да.",
        "Нет.",
        "Конечно.",
        "Нет конечно.",
        "Змей говорит - да.",
        "Ответ змея - нет.",
        "Как мне кажется, да.",
        "Мне кажется что нет.",
    ]
    var rand = Math.floor(Math.random() * answs.length);

    emb = new Discord.RichEmbed()
        .setColor(0x6495ed)
        .setTitle(question)
        .setDescription(answs[rand])
        .setThumbnail("https://www.dropbox.com/s/raw/vexrqo811ld5x6u/8-ball-png-9.png");

    message.channel.send(emb);
    return;
}