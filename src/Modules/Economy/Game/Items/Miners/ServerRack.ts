import ItemMiner from "../ItemMiner";

export class ServerRack extends ItemMiner {
    constructor(id: string){
        super(id);
        this.setName("Server Rack")
            .setDescription("Contains 8 Server Units inside. Good way to manage your units. Can be used as CPT Miner.")
            .setTradeable(true)
            .setSellable(true)
            //.setIconURL(undefined)
            .setSizeSlots(4)
            .setPowerConsumption(18000)
            .setMiningRate(2700);
    }
}