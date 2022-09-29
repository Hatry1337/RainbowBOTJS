import Item from "../Item";
import ItemMiner from "../ItemMiner";

export class Laptop extends ItemMiner {
    constructor(id: string){
        super(id);
        this.setName("Laptop")
            .setDescription("Regular laptop for personal needs. Can be used as CPT Miner.")
            .setTradeable(true)
            .setSellable(true)
            .setIconURL("https://static.rainbowbot.xyz/bot/content/items/icons/item_laptop.png")
            .setSizeSlots(1)
            .setPowerConsumption(200)
            .setMiningRate(12.5);
    }
}