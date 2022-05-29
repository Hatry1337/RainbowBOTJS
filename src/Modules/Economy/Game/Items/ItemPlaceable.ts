import Item from "./Item";

export default class ItemPlaceable extends Item {
    constructor(item: Item, public sizeSlots: number){
        super(item.id, item.name, item.description, item.isSellable(), item.isTradeable());
        this.is_placeable = true;
    }
}