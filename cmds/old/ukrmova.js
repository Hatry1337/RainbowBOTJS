var moduleName = "UkrMova";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class UkrMova {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.RandElement = Utils.arrayRandElement;
        this.Database = Database;
    }
    execute = async function (message, pipef) {
        let words = [
            "Гинеколог - пихвозаглядач",
            "Парашютисты - падалки",
            "Зажигалка - спалахуйка",
            "Бабочка - залупівка",
            "Подсчитай - пiдрахуй",
            "Ужасы - жахи",
            "Лифт - міжповерховий дротохід",
            "Кощей бессмертный - чахлик невмирущий",
            "Сексуальный маньяк - пісюнковий злодій",
            "Киндер-сюрприз - яйко-сподівайко",
            "Соковыжималка - сіковичовичувалка",
            "Вертолет - гвинтокрил",
            "Коробка передач - скринька перепихунців",
            "Поджопник - пiдсрачник",
            "Пылесос - смоктопил",
            "Шприц - штрикалка",
            "Зонт - розчипірка",
            "Собака-ищейка - цуцик-нишпорка",
            "Презерватив - гумовий нацюцюрник",
            "Как закалялась сталь - Як дрючилася железка",
            "Дискотека - Дискогапавка",
            "Гинеколог - пихвозаглядач",
        ];
        var word = this.RandElement(words);
        if(pipef){
            await pipef(word);
        }else {
            var emb = new this.Discord.MessageEmbed()
                .setTitle(word)
                .setColor(0x42aaff);
            message.channel.send(emb);
        }
        this.Database.writeLog('ukrmova', message.author.id, message.guild.name,
            JSON.stringify({
                Message: `User '${message.author.tag}' watched ukrainian word '${word}'.`
            }));
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = UkrMova;
