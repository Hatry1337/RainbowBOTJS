import { Access, AccessTarget, Module, Synergy } from "synergy3";
import { StorageWrapper } from "./Storage/StorageWrapper";
import { ItemsCTL } from "./Controls/ItemsCTL";
import { ShopCTL } from "./Controls/ShopCTL";
import EconomyCTL from "./Controls/EconomyCTL";
import Control from "./Controls/Control";
import { MiningCTL } from "./Controls/MiningCTL";
import TopCTL from "./Controls/TopCTL";

export const ECONOMY_CONSTANTS = {
    wattHourCost: 0.00727
}

export default class Economy extends Module{
    public Name:        string = "[Alpha] Economy";
    public Description: string = "The Economy Module.";
    public Category:    string = "Economy";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.PLAYER() ]

    private storage: StorageWrapper;
    private controls: Control[];

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);

        this.storage = new StorageWrapper(this.bot, this.UUID);

        this.controls = [
            new ItemsCTL(this.bot, this, this.storage),
            new ShopCTL(this.bot, this, this.storage),
            new EconomyCTL(this.bot, this, this.storage),
            new MiningCTL(this.bot, this, this.storage),
            new TopCTL(this.bot, this, this.storage)
        ]
    }

    public async Init(){
        await this.storage.createRootObject();

        for(let c of this.controls){
            if(c.Init){
                await c.Init();
            }
        }
    }

    public async UnLoad(){
        for(let c of this.controls){
            if(c.Unload){
                await c.Unload();
            }
        }
    }
}