import ItemPlaceable from "./ItemPlaceable";

export default class ItemPowerConsumer extends ItemPlaceable {
    public powerConsumption: number = 100;
    constructor(id: string){
        super(id);
    }

    public setPowerConsumption(powerConsumption: number){
        this.powerConsumption = powerConsumption;
        return this;
    }
}