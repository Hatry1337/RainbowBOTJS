import Discord from "discord.js";
import { Access, AccessTarget, Colors, Module, Synergy, Utils }  from "synergy3";

export default class EiBall extends Module{
    public Name:        string = "8Ball";
    public Description: string = "Using this command you can ask 8Ball something.";
    public Category:    string = "Utility";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.PLAYER() ];

    private PhrasesYes: string[] = [
        "I think yes.",
        "Clearly right.",
        "Yes.",
        "Of course.",
        "Snake says - Yes.",
        "I think so.",
    ]

    private PhrasesNo: string[] = [
        "Probably not.",
        "Clearly not.",
        "No.",
        "Of course no.",
        "Snake says - No.",
        "I don't think so.",
    ]

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);
        this.SlashCommands.push(
            this.bot.interactions.createSlashCommand(this.Name.toLowerCase(), this.Access, this, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
            .build(builder => builder
                .setDescription(this.Description)
                .addStringOption(opt => opt
                    .setName("question")
                    .setDescription("Question to ask Magic Eight Ball.")
                    .setRequired(true)
                )
            )
            .onExecute(this.Run.bind(this))
            .commit()
        );
    }
    
    public Run(interaction: Discord.CommandInteraction){
        return new Promise<void>(async (resolve, reject) => {
            let question = interaction.options.getString("question", true);
            let flag = Math.random() < 0.5;
            let phrase = flag ? Utils.arrayRandElement(this.PhrasesYes) : Utils.arrayRandElement(this.PhrasesNo);

            var embd = new Discord.MessageEmbed({
                title: question,
                description: phrase,
                thumbnail: { url: "https://static.rainbowbot.xyz/pictures/rbot/8ball/8-ball.png" },
                color: Colors.Noraml
            });
            return resolve(await interaction.reply({ embeds: [ embd ] }).catch(reject));
        });
    }
}