
console.log("Imported rhelp");

function rhelp(message, Discord) {
    emb = new Discord.MessageEmbed()
        .setTitle('Помощь по командам:')
        .addFields([
            { name : "!rhelp", value : "Показывает это сообщение", inline : true },
            { name : "!upd", value : "Показывает апдейт-лог", inline : true },
            { name : "!ukrmova", value : "Рандомное украинское слово с переводом", inline : true },
            { name : "!uptime", value : "Выводит сколько времени прошло с момента включения бота.", inline : true },
            { name : "!rstats", value : "Выводит статистику бота (пинг, сообщения, аптайм).", inline : true },
            { name : "!rep 'Сообщение'", value : "Отправить сообщение Администратору (если нашли баг, недоработку, или еще какие то проблемы)", inline : true },
            { name : "!profile @user", value : "Выводит профиль указаного игрока.", inline : true },
            { name : "!shop", value : "Открывает магазин предметов.", inline : true },
            { name : "!items @user", value : "Открывает инвентарь с предметами указанного игрока.", inline : true },
            { name : "!getmoney", value : "Запустить майнинг/Снять деньги с майнеров.", inline : true },
            { name : "!freevip", value : "Получить бесплатный VIP статус.", inline : true },
            { name : "!pay @user <количество>", value : "Передать поинты указаному игроку.", inline : true },
            { name : "!hentai <id картинки>", value : "Присылает рандомную хентай картинку) (не смотри если нет 18!!)", inline : true },
            { name : "!hentai like <номер картинки>", value : "Поставить лайк на указаную картинку.", inline: true},
            { name : "!hentai offer <url картинки>", value : "Предложить свою картинку, которая будет добавлена в !hentai.", inline: true},
            { name : "!hentai stats", value: "Статистика команды !hentai.", inline: true },
            { name : "!play <ссылка или название>", value: "Включает музыку в канале в котором вы находитесь.", inline: true },
            { name : "!stop", value : "Выключает музыку в канале в котором вы находитесь.", inline : true },
            { name : "!top", value : "Топ 10 игроков по Поинтам", inline : true },
            { name : "!roll", value : "Рандомное число от 1 до 100", inline : true },
            { name : "!8ball <Вопрос>", value : "Ответ на все ваши вопросы", inline : true },
            { name : "!randcat", value : "Рандомная картинка с котиками", inline : true },
            { name : "!lolilic", value : "Получить лицензию на Лольку, или просмотреть если уже получили.", inline : true },

            { name : "**Информация:**", value : "```07.01.2020 Теперь бот полностью на JavaScript!\nСделал сайт с топом игроков``` http://www.rainbowbot.xyz/", inline : false },

        ])
        .setColor(0x8b00ff);
    message.channel.send(embed = emb);
}
//module.exports = {rhelp}
