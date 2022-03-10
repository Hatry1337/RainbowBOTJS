import Discord from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Colors, Module, ModuleManager, Utils }  from "rainbowbot-core";

export default class EiBall extends Module{
    public Name:        string = "8Ball";
    public Usage:       string = "`!8ball <question>`\n\n" +
                          "**Example:**\n" +
                          "`!8ball Does she love me?` - Get answer on a question from 8Ball.\n\n";

    public Description: string = "Using this command you can ask 8Ball something.";
    public Category:    string = "Utility";
    public Author:      string = "Thomasss#9258";

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

    constructor(Controller: ModuleManager, UUID: string) {
        super(Controller, UUID);
        this.SlashCommands.push(
            new SlashCommandBuilder()
                .setName(this.Name.toLowerCase())
                .setDescription(this.Description)
                .addStringOption(opt => opt
                    .setName("question")
                    .setDescription("Question to ask Magic Eight Ball.")
                    .setRequired(true)
                ) as SlashCommandBuilder
        );
    }
    
    public Run(interaction: Discord.CommandInteraction){
        return new Promise<Discord.Message | void>(async (resolve, reject) => {
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