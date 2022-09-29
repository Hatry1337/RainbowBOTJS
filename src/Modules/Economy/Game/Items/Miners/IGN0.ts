import ItemMiner from "../ItemMiner";

export class IGN0 extends ItemMiner {
    constructor(id: string){
        super(id);
        this.setName("ASIC Miner IGN-0")
            .setDescription("ASIC miners are specially designed for mining crypto currencies, so they do it in very effective way.")
            .setTradeable(true)
            .setSellable(true)
            //.setIconURL(undefined)
            .setSizeSlots(2)
            .setPowerConsumption(3000)
            .setMiningRate(50000);
    }
}