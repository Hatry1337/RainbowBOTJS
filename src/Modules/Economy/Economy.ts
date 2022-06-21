import { Access, AccessTarget, Colors, Module, Synergy, SynergyUserError, User } from "synergy3";
import Discord from "discord.js";
import { StorageWrapper } from "./Storage/StorageWrapper";
import Table from "cli-table";
import Shop from "./Shop/Shop";
import { ItemsCTL } from "./ItemsCTL";
import { ShopCTL } from "./ShopCTL";

export default class Economy extends Module{
    public Name:        string = "Economy";
    public Description: string = "The Economy Module.";
    public Category:    string = "Economy";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.PLAYER() ]

    private storage: StorageWrapper;
    private shop: ShopCTL;
    private items: ItemsCTL;

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);

        this.storage = new StorageWrapper(this.bot, this.UUID);
        this.items = new ItemsCTL(this.bot, this.storage, this);
        this.shop = new ShopCTL(this.bot, this.storage, this);

        this.createSlashCommand("items", undefined, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
        .build(builder => builder
            .setDescription("Check out your items.")
        )
        .onExecute(this.items.handleInteraction.bind(this.items))
        .commit()

        this.createSlashCommand("shop", undefined, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
        .build(builder => builder
            .setDescription("Imagine a place where you can buy something. So here it is.")
        )
        .onExecute(this.shop.handleInteraction.bind(this.shop))
        .commit()


        this.createSlashCommand("getmoney", undefined, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
        .build(builder => builder
            .setDescription("Redeem Points from PTC Miners.")
        )
        .onExecute(this.GetMoney.bind(this))
        .commit()
    }

    public async Init(){
        await this.storage.createRootObject();
    }

    


    public async GetMoney(interaction: Discord.CommandInteraction){

    }
}