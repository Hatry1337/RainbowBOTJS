import { Item } from "../../Structures/Items/Item";
import { ItemPlaceable } from "../../Structures/Items/ItemPlaceable";
import { Miner } from "../../Structures/Items/Miner";
import { ItemStack } from "../../Structures/ItemStack";
import { RegistryBase } from "../Registry/RegistryBase";
import { RegistryEntry } from "../Registry/RegistryEntry";
import { IDataSerialized } from "./Serializeable";

export class Deserializer{
    public classesDefined: (new (...args: any[]) => any)[] = [];
    constructor(){
        this.classesDefined.push(
            //Define all pre-runtime classes here:
            RegistryBase,
            RegistryEntry,
            Item,
            ItemPlaceable,
            Miner,
            ItemStack
        )
    }

    public deserialize(data: IDataSerialized){
        if(data.type !== this.constructor.name) throw new TypeError(`Given data is not type of ${this.constructor.name}.`);
        //if(!data.subtype) throw new TypeError("This type must have a subtype.");

        let subtype = ClassDef.find(c => c.name === data.subtype);
        if(!subtype) throw new TypeError("Given data subtype is not defined in ClassDef.");

        if(!(subtype.prototype instanceof Serializeable)) throw new TypeError("Given data subtype is not serializeable.");
        let inst = new subtype() as this;
        //this.entry = inst;
        return inst;
    }
}