import Discord from "discord.js";
import CommandsController from "../CommandsController";
import { Guild } from "../Models/Guild";
import { User } from "../Models/User";

interface ICommand{
    Name: string;
    Trigger: string;
    Usage: string;
    Description: string;
    Category: string;
    Author: string;
    Test(message: Discord.Message, guild?: Guild, user?: User): boolean;
    Test(message: Discord.Message, guild: Guild, user?: User): boolean;
    Test(message: Discord.Message, guild: Guild, user: User): boolean;

    Run(message: Discord.Message, guild?: Guild, user?: User): Promise<Discord.Message>;
    Run(message: Discord.Message, guild: Guild, user?: User): Promise<Discord.Message>;
    Run(message: Discord.Message, guild: Guild, user: User): Promise<Discord.Message>;
    Controller: CommandsController;
}

export = ICommand;