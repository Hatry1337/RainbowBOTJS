import Discord from "discord.js";
import ICommand from "../ICommand";
import { Guild } from "../../Models/Guild";
import { Emojis, Colors, Utils } from "../../Utils";
import CommandsController from "../../CommandsController";
import log4js from "log4js";
import { User } from "../../Models/User";
import { ItemController } from "./ItemController";
import { RecipeController } from "./RecipeController";

const logger = log4js.getLogger("command");

class Economy implements ICommand{
    Name:        string = "Economy";
    Trigger:     string = "!economy";
    Usage:       string = "`!economy`";

    Description: string = "Info and guidelines about economy game.";
    Category:    string = "Economy";
    Author:      string = "Thomasss#9258";
    Controller: CommandsController

    Items: ItemController;
    Recipes: RecipeController;

    constructor(controller: CommandsController) {
        this.Controller = controller; 

        this.Items = new ItemController(this);
        this.Recipes = new RecipeController(this);
        
        this.Controller.Client.on("ready", async () => {
            await this.Items.CheckDefs();
            await this.Recipes.CheckDefs();
        });
    }
    
    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!economy");
    }
    
    Run(message: Discord.Message, guild: Guild, user: User){
        return new Promise<Discord.Message>(async (resolve, reject) => {
            return resolve(await Utils.ErrMsg("Not implemented yet.", message.channel));
        });
    }
}

export = Economy;