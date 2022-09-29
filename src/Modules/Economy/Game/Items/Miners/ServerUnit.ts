import ItemMiner from "../ItemMiner";

export class ServerUnit extends ItemMiner {
    constructor(id: string){
        super(id);
        this.setName("Server Unit")
            .setDescription("Commonly used in Datacenters but also can work lying under your bed. Can be used as CPT Miner.")
            .setTradeable(true)
            .setSellable(true)
            //.setIconURL(undefined)
            .setSizeSlots(2)
            .setPowerConsumption(2200)
            .setMiningRate(278);
    }
}