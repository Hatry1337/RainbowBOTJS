import Discord from "discord.js";
import { Guild } from "../Models/Guild";
import { User } from "../Models/User";
import ModuleManager from "../ModuleManager";

export default interface IModule{
    Name: string;
    Usage: string;
    Description: string;
    Category: string;
    Author: string;
    
    InitPriority?: number;
    Init?(): Promise<void>;
    UnLoad?(): Promise<void>;

    Test(interaction: Discord.Interaction): boolean;
    Run(interaction: Discord.Interaction): Promise<Discord.Message>;

    Controller: ModuleManager;
}
