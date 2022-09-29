import ItemMiner from "../ItemMiner";

export class DesktopPC extends ItemMiner {
    constructor(id: string){
        super(id);
        this.setName("Desktop PC")
            .setDescription("Regular computer for personal needs. Can be used as CPT Miner.")
            .setSellable(true)
            .setTradeable(true)
            //.setIconURL(undefined)
            .setSizeSlots(1)
            .setPowerConsumption(750)
            .setMiningRate(50);
    }
}