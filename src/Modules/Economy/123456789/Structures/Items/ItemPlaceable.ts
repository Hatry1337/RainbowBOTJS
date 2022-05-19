import { Item, IItemDataSerialized } from "./Item";

export interface IItemPlaceableSerialized extends IItemDataSerialized{
    isPlaceable: boolean;
    size: number;
}

export class ItemPlaceable extends Item{
    public isPlaceable: boolean = false;
    constructor(id: number, name: string, description: string, public size: number){
        super(id, name, description);
    }
}