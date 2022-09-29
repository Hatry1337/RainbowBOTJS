import ItemMiner from "../ItemMiner";

export class IGN4 extends ItemMiner {
    constructor(id: string){
        super(id);
        this.setName("ASIC Miner IGN-4")
            .setDescription("ASIC miners are specially designed for mining crypto currencies, so they do it in very effective way.")
            .setTradeable(true)
            .setSellable(true)
            //.setIconURL(undefined)
            .setSizeSlots(2)
            .setPowerConsumption(11000)
            .setMiningRate(727500);
    }
}