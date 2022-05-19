import { IItemPlaceableSerialized, ItemPlaceable } from "./ItemPlaceable";

export interface IMinerSerialized extends IItemPlaceableSerialized{
    powerConsumption: number;
    miningRate: number;
}

export class Miner extends ItemPlaceable{
    constructor(id: number, name: string, description: string, size: number, public powerConsumption: number, public miningRate: number){
        super(id, name, description, size);
        this.isPlaceable = true;
    }
}