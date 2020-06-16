var moduleName = "UkrMova";
function moduleOnLoad(){
    console.log(`Module "${this.name}" loaded!`)
}

class UkrMova {
    constructor(Discord, Database, Client, Fs, Utils) {
        this.Discord = Discord;
        this.RandElement = Utils.arrayRandElement;
    }
    execute = function (message) {
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

        var emb = new this.Discord.MessageEmbed()
            .setTitle(this.RandElement(words))
            .setColor(0x42aaff);
        message.channel.send(emb);
    }
}

module.exports.info = {
    name: moduleName,
    onLoad: moduleOnLoad
};
module.exports.class = UkrMova;
