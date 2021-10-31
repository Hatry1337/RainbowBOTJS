import Discord from "discord.js";
import ICommand from "./ICommand";
import CommandsController from "../CommandsController";

class Placeholder implements ICommand{
    Name:        string = "Placeholder";
    Trigger:     string = "!test_command#";
    Usage:       string = "U can't use this command, lol";
    Description: string = "This is test command for debugging. #";
    Category:    string = "Dev";
    Author:      string = "Thomasss#9258";
    Controller: CommandsController

    constructor(controller: CommandsController) {
        this.Controller = controller;
        var index = this.Controller.Commands.length;
        this.Name += index.toString();
        this.Trigger += index.toString();
        this.Description += index.toString();
    }
    
    Test(mesage: Discord.Message){
        return false;
    }
    
    Run(message: Discord.Message){
        return new Promise<Discord.Message>(async (resolve, reject) => {
            resolve(await message.channel.send("Wait, what.. How do you run this command?!!"));
        });
    }
}

export = Placeholder;