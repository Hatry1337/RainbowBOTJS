
console.log("Imported rhelp");

function rhelp(message, Discord) {
    emb = new Discord.RichEmbed()
        .setTitle('Помощь по командам:')
        .addField(name = "!rhelp", value = "Показывает это сообщение", inline = true)
        .addField(name = "!upd", value = "Показывает апдейт-лог", inline = true)
        .addField(name = "!ukrmova", value = "Рандомное украинское слово с переводом", inline = true)
        .addField(name = "!uptime", value = "Выводит сколько времени прошло с момента включения бота.", inline = true)
        .addField(name = "!rstats", value = "Выводит статистику бота (пинг, сообщения, аптайм).", inline = true)
        .addField(name = "!rep 'Сообщение'", value = "Отправить сообщение Администратору (если нашли баг, недоработку, или еще какие то проблемы)", inline = true)
        .addField(name = "!profile @user", value = "Выводит профиль указаного игрока.", inline = true)
        .addField(name = "!shop", value = "Открывает магазин предметов.", inline = true)
        .addField(name = "!items @user", value = "Открывает инвентарь с предметами указанного игрока.", inline = true)
        .addField(name = "!getmoney", value = "Запустить майнинг/Снять деньги с майнеров.", inline = true)
        .addField(name = "!freevip", value = "Получить бесплатный VIP статус.", inline = true)
        .addField(name = "!pay @user <количество>", value = "Передать поинты указаному игроку.", inline = true)
        .addField(name = "!hentai <id картинки>", value = "Присылает рандомную хентай картинку) (не смотри если нет 18!!)", inline = true)
        //.addField(name = "!like_hentai <номер картинки>", value = "Поставить лайк на указаную картинку.", inline= true)
        //.addField(name = "!hentai_list <номер страницы>", value = "Показать список всех хентай картинок.", inline= true)
        .addField(name = "!play <ссылка или название>", value = "Включает музыку в канале в котором вы находитесь.", inline = true)
        .addField(name = "!stop", value = "Выключает музыку в канале в котором вы находитесь.", inline = true)
        //.addField(name = "!top <points или lvl>", value = "Топ 10 игроков по Поинтам если вы ввели points, и по уровню если ввели lvl", inline= true)
        .addField(name = "!roll", value = "Рандомное число от 1 до 100", inline = true)
        .addField(name = "!8ball <Вопрос>", value = "Ответ на все ваши вопросы", inline = true)
        .addField(name = "!randcat", value = "Рандомная картинка с котиками", inline = true)

        .addField(name = "**Информация:**", value = "```07.01.2020 Теперь бот полностью на JavaScript!\nСделал сайт с топом игроков``` http://www.rainbowbot.xyz/", inline = false)
        .setColor(0x8b00ff)
    message.channel.send(embed = emb)
}
//module.exports = {rhelp}
