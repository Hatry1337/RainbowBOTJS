import { ClassDef } from "../Game/ClassDef";
import { RegistryEntry } from "../Game/Registry/RegistryEntry";
import { IDataSerialized } from "../Game/Serializer/Serializeable";
import { ItemDef } from "./ItemDef";
import { Item } from "./Items/Item";

export interface IItemStackSerialized {
    size: number;
    item: number;
}

export class ItemStack extends RegistryEntry{
    constructor(public size: number, public item: Item) {
        super();
    }

    public serialize(){
        let data: IDataSerialized<IItemStackSerialized> = {
            type: this.constructor.name,
            data: {
                size: this.size,
                item: this.item.id
            }
        };
        return data;
    }

    public deserialize(data: IDataSerialized<IItemStackSerialized>){
        if(data.type !== this.constructor.name) throw new TypeError(`Given data is not type of ${this.constructor.name}.`);

        let type = ClassDef.find(c => c?.name === data.type);
        if(!type) throw new TypeError(`Given "${data.type}" is not defined in ClassDef.`);

        let item = ItemDef.find(i => i.id === data.data.item);
        if(!item) throw new TypeError(`Given item(${data.data.item}) is not defined in ItemDefs.`);

        let inst = new type(data.data.size, 
                            item ) as this;
        return inst;
    }
}