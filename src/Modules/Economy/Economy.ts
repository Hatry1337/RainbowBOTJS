import { Access, Module, Synergy, User } from "synergy3";
import Discord from "discord.js";
import IEconomyStorageContainer from "./Game/Interfaces/IEconomyStorageContainer";
import { StorageWrapper } from "./Storage/StorageWrapper";

export default class Economy extends Module{
    public Name:        string = "Economy";
    public Description: string = "The Economy Module.";
    public Category:    string = "Economy";
    public Author:      string = "Thomasss#9258";

    public Access: string[] = [ Access.PLAYER() ]

    private storage: StorageWrapper;

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);
        this.createSlashCommand("items", undefined, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
        .build(builder => builder
            .setDescription("Check out your items.")
        )
        .onExecute(this.Items.bind(this))
        .commit()

        this.createSlashCommand("getmoney", undefined, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
        .build(builder => builder
            .setDescription("Redeem Points from PTC Miners.")
        )
        .onExecute(this.GetMoney.bind(this))
        .commit()
        this.storage = new StorageWrapper(this.bot, this.UUID);
    }

    public async Init(){
        await this.storage.createRootObject();
    }

    public createPlayer(user: User){
        
    }

    public async Items(interaction: Discord.CommandInteraction){

    }

    public async Shop(interaction: Discord.CommandInteraction){

    }



    public async GetMoney(interaction: Discord.CommandInteraction){

    }
}