import Item from "./Item";

export default class ItemRoom extends Item {
    constructor(item: Item, public powerGrid: number, public slots: number, public weeklyFee: number){
        super(item.id, item.name, item.description, item.isSellable(), item.isTradeable());
    }
}