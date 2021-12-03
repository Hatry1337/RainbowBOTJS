import Discord from "discord.js";
import ICommand from "../ICommand";
import { Guild } from "../../Models/Guild";
import { Emojis, Colors, Utils } from "../../Utils";
import CommandsController from "../../CommandsController";
import log4js from "log4js";

const logger = log4js.getLogger("command");

export default class EiBall implements ICommand{
    Name:        string = "8Ball";
    Trigger:     string = "!8ball";
    Usage:       string = "`!8ball <question>`\n\n" +
                          "**Example:**\n" +
                          "`!8ball Does she love me?` - Get answer on a question from 8Ball.\n\n";

    Description: string = "Using this command you can ask 8Ball something.";
    Category:    string = "Utility";
    Author:      string = "Thomasss#9258";
    Controller: CommandsController

    PhrasesYes: string[] = [
        "I think yes.",
        "Clearly right.",
        "Yes.",
        "Of course.",
        "Snake says - Yes.",
        "I think so.",
    ]

    PhrasesNo: string[] = [
        "Probably not.",
        "Clearly not.",
        "No.",
        "Of course no.",
        "Snake says - No.",
        "I don't think so.",
    ]

    constructor(controller: CommandsController) {
        this.Controller = controller;
    }
    
    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!8ball");
    }
    
    Run(message: Discord.Message){
        return new Promise<Discord.Message>(async (resolve, reject) => {
            let question = message.content.slice(this.Trigger.length + 1);
            if(question.length <= 0){
                return resolve(await Utils.ErrMsg("No question specified!", message.channel));
            }

            let flag = Math.random() < 0.5;
            let phrase = flag ? Utils.arrayRandElement(this.PhrasesYes) : Utils.arrayRandElement(this.PhrasesNo);

            var embd = new Discord.MessageEmbed({
                title: question,
                description: phrase,
                thumbnail: { url: "https://static.rainbowbot.xyz/pictures/rbot/8ball/8-ball.png" },
                color: Colors.Noraml
            });
            return resolve(await message.channel.send(embd));
        });
    }
}