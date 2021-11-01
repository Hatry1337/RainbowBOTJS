import Discord from "discord.js";
import { Guild } from "../../../Models/Guild";
import { User } from "../../../Models/User";

export interface IMachine{
    Name: string;
    Code: string;
    Description: string;
    Actions: string;
    Run(message: Discord.Message, guild: Guild, user: User): Promise<Discord.Message>
}