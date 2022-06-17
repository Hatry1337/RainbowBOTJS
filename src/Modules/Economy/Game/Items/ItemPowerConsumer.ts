import ItemPlaceable from "./ItemPlaceable";

export default class ItemPowerConsumer extends ItemPlaceable {
    constructor(item: ItemPlaceable, public powerConsumption: number){
        super(item, item.sizeSlots);
    }
}