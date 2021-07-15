import Discord from "discord.js";
import CommandsController from "../CommandsController";

interface ICommand{
    Name: string;
    Trigger: string;
    Usage: string;
    Description: string;
    Category: string;
    Test(message: Discord.Message): boolean;
    Run(message: Discord.Message): Promise<Discord.Message>;
    Controller: CommandsController;
}

export = ICommand;