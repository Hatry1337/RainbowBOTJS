import CommandsController from "../CommandsController";
import ICommand from "./ICommand";
import Discord from "discord.js";
import { GlobalLogger } from "../GlobalLogger";
import { Guild } from "../Models/Guild";
import { User } from "../Models/User";

export default class Command implements ICommand{
    Name:        string = "Command";
    Trigger:     string = "!<NONE>";
    Usage:       string = "This is base command. Don't use it as command module.";

    Description: string = "This is base command.";
    Category:    string = "BOT";
    Author:      string = "Thomasss#9258";
    Controller: CommandsController

    constructor(controller: CommandsController) {
        this.Controller = controller;
    }
    
    Test(message: Discord.Message, guild?: Guild, user?: User): boolean;
    Test(message: Discord.Message, guild: Guild, user?: User): boolean;
    Test(message: Discord.Message, guild: Guild, user: User): boolean;

    Test(mesage: Discord.Message){
        return false;
    }
    
    async Init?(){
        for(let i = 0; i < 5; i++){
            GlobalLogger.command.warn(this.Name, "DONT USE THIS AS COMMAND MODULE I SAID, FUCKING FAGGOT!!!!!!!!");
        }
    }
    

    Run(message: Discord.Message, guild?: Guild, user?: User): Promise<Discord.Message>;
    Run(message: Discord.Message, guild: Guild, user?: User): Promise<Discord.Message>;
    Run(message: Discord.Message, guild: Guild, user: User): Promise<Discord.Message>;

    async Run(message: Discord.Message){
        return await message.channel.send("DONT USE THIS AS COMMAND MODULE I SAID, FUCKING FAGGOT!!!!!!!!");
    }
}