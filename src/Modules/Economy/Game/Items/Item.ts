import ItemPlaceable from "./ItemPlaceable";

export default class Item{
    private is_placeable: boolean = false;
    constructor(public readonly id: number, public name: string, public description: string, private is_sellable: boolean = false, private is_tradeable: boolean = false){

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
}