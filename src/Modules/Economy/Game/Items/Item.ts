import ItemPlaceable from "./ItemPlaceable";
import ItemUsable from "./ItemUsable";

export default class Item{
    protected is_placeable: boolean = false;
    protected is_usable: boolean = false;
    constructor(public readonly id: number, public name: string, public description: string, protected is_sellable: boolean = false, protected is_tradeable: boolean = false){

    }

    public isSellable() {
        return this.is_sellable;
    }

    public isTradeable() {
        return this.is_sellable;
    }

    public isPlaceable(): this is ItemPlaceable {
        return this.is_placeable;
    }

    public isUsable(): this is ItemUsable {
        return this.is_usable;
    }
}