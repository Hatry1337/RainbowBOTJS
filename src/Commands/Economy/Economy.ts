import Discord from "discord.js";
import ICommand from "../ICommand";
import { Guild } from "../../Models/Guild";
import { Emojis, Colors, Utils } from "../../Utils";
import CommandsController from "../../CommandsController";
import log4js from "log4js";
import { User } from "../../Models/User";
import { Items } from "./Items";
import { TileEntity } from "./TileEntitys/TileEntity";
import { TEFurnace } from "./TileEntitys/TEFurnace";
import { ItemStack } from "./Items/ItemStack";
import { Item } from "./Items/Item";
import { FurnaceRecipes } from "./Items/crafting/FurnaceRecipes";


const logger = log4js.getLogger("command");

class Economy implements ICommand{
    Name:        string = "Economy";
    Trigger:     string = "!economy";
    Usage:       string = "`!economy`";

    Description: string = "Info and guidelines about economy game.";
    Category:    string = "Economy";
    Author:      string = "Thomasss#9258";
    Controller: CommandsController

    Ticker: NodeJS.Timeout;
    furnaceRecipes: FurnaceRecipes;

    constructor(controller: CommandsController) {
        this.Controller = controller; 

        this.furnaceRecipes = new FurnaceRecipes(); 

        this.Ticker = setInterval(() => {
            TileEntity.REGISTRY.tick();
        }, 500);

        var furnace = new TEFurnace();
        TileEntity.REGISTRY.register(1, "te:furnace", furnace);
        
        furnace.setInventorySlotContents(0, new ItemStack(Items.IRON_ORE, 4));
        furnace.setInventorySlotContents(1, new ItemStack(Items.COAL));

        setInterval(() => {
            console.log("[IN]", furnace.getStackInSlot(0));
            console.log("[FL]", furnace.getStackInSlot(1));
            console.log("[OUT]", furnace.getStackInSlot(2));
            console.log("=");
        }, 500);
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