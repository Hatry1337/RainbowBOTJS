import Item from "../Item";
import ItemMiner from "../ItemMiner";

export class MiningFacility<T extends ItemMiner> extends ItemMiner {
    constructor(id: string, basedOn: T, size: number){
        super(id);

        let power = (basedOn.powerConsumption * size) + 500000;
        let rate = (basedOn.miningRate * size) * 1.1;

        this.setName(`Mining Facility (${basedOn.name} based.)`)
            .setDescription("A big place where you can put a lot of miners. Miners have 10% bonus in facilities.")
            .setTradeable(false)
            .setSellable(true)
            //.setIconURL(undefined)
            .setSizeSlots(2000)
            .setPowerConsumption(power)
            .setMiningRate(rate);
    }
}