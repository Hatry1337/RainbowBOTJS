import { RegistryEntry } from "../../Game/Registry/RegistryEntry";
import { IDataSerialized } from "../../Game/Serializer/Serializeable";
import { ItemDef } from "../ItemDef";

export interface IItemDataSerialized{
    id: number;
}

export class Item extends RegistryEntry{
    constructor(public id: number, public name: string, public description: string){
        super();
    }

    public serialize(){
        let data: IDataSerialized<IItemDataSerialized> = {
            type: this.constructor.name,
            data: {
                id: this.id
            }
        };
        return data;
    }

    public deserialize(data: IDataSerialized<IItemDataSerialized>){
        if(data.type !== this.constructor.name) throw new TypeError(`Given data is not type of ${this.constructor.name}.`);

        let item = ItemDef.find(i => i.id === data.data.id);
        if(!item) throw new TypeError("Given item is not defined in ItemDefs.");

        return item as this;
    }
}