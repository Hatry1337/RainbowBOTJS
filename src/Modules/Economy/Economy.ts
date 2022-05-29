import { Access, Colors, Module, Synergy, SynergyUserError, User } from "synergy3";
import Discord from "discord.js";
import { StorageWrapper } from "./Storage/StorageWrapper";
import Table from "cli-table";
import Shop from "./Shop/Shop";
import { ItemsCTL } from "./ItemsCTL";

export default class Economy extends Module{
    public Name:        string = "Economy";
    public Description: string = "The Economy Module.";
    public Category:    string = "Economy";
    public Author:      string = "Thomasss#9258";

    public Access: string[] = [ Access.PLAYER() ]

    private storage: StorageWrapper;
    private shop: Shop;
    private items: ItemsCTL;

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);

        this.storage = new StorageWrapper(this.bot, this.UUID);
        this.shop = new Shop(this.bot, this.storage);
        this.items = new ItemsCTL(this.bot, this.storage, this);

        this.createSlashCommand("items", undefined, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
        .build(builder => builder
            .setDescription("Check out your items.")
        )
        .onExecute(this.items.handleInteraction.bind(this.items))
        .commit()

        this.createSlashCommand("shop", undefined, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
        .build(builder => builder
            .setDescription("Place where you can buy something.")
            .addSubcommand(sub => sub
                .setName("view")
                .setDescription("View what items you can purchase.")    
            )
            .addSubcommand(sub => sub
                .setName("buy")
                .setDescription("Make purchase of something.")    
                .addStringOption(opt => opt
                    .setName("slot")
                    .setDescription("Number of item slot to purchase. (ex.: '1.3')")
                    .setRequired(true)
                )
                .addIntegerOption(opt => opt
                    .setName("count")
                    .setDescription("How much items you want to purchase.")
                    .setMinValue(1)
                )
            )
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