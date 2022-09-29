import ItemPlaceable from "./ItemPlaceable";
import ItemUsable from "./ItemUsable";

export default class Item{
    protected is_placeable: boolean = false;
    protected is_usable: boolean = false;
    protected is_sellable: boolean = false;
    protected is_tradeable: boolean = false;

    public name: string = "Unnamed Item";
    public description: string = "No item description defined.";
    public iconUrl?: string;

    constructor(public readonly id: string){
    }

    public setName(name: string){
        this.name = name;
        return this;
    }
    
    public setDescription(description: string){
        this.description = description;
        return this;
    }
    
    public setIconURL(url: string){
        this.iconUrl = url;
        return this;
    }

    public setSellable(sellable: boolean){
        this.is_sellable = sellable;
        return this;
    }

    public setTradeable(tradeable: boolean){
        this.is_tradeable = tradeable;
        return this;
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