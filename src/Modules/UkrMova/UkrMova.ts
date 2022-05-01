import { Access, Colors, Module, Synergy, Utils } from "synergy3";
import Discord from "discord.js";

export default class UkrMova extends Module{
    public Name:        string = "UkrMova";
    public Description: string = "Using this command you can explore funny ukrainian words.";
    public Category:    string = "Fun";
    public Author:      string = "Thomasss#9258";

    public Access: string[] = [ Access.PLAYER() ]

    public words = [
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

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);
        this.createSlashCommand(this.Name.toLowerCase(), undefined, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
        .build(builder => builder
            .setDescription(this.Description)
        )
        .onExecute(this.Run.bind(this))
        .commit()
    }

    public async Run(interaction: Discord.CommandInteraction){
        let word = Utils.arrayRandElement(this.words);
        let emb = new Discord.MessageEmbed()
            .setTitle(word)
            .setColor(Colors.Noraml);
            
        await interaction.reply({embeds: [emb] });
    }
}