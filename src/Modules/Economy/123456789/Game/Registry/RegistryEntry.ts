import { IDataSerialized, Serializeable } from "../Serializer/Serializeable";
import { ClassDef } from "../ClassDef";

export class RegistryEntry extends Serializeable{
    constructor(){
        super();
    }

    public serialize(){
        let data: IDataSerialized = {
            type: this.constructor.name,
            //subtype: this.entry.constructor.name,
            data: JSON.parse(JSON.stringify(this))
        };
        return data;
    }

    public deserialize(data: IDataSerialized){
        if(data.type !== this.constructor.name) throw new TypeError(`Given data is not type of ${this.constructor.name}.`);




        if(data.type !== this.constructor.name) throw new TypeError(`Given data is not type of ${this.constructor.name}.`);
        //if(!data.subtype) throw new TypeError("This type must have a subtype.");

        let subtype = ClassDef.find(c => c.name === data.subtype);
        if(!subtype) throw new TypeError("Given data subtype is not defined in ClassDef.");

        if(!(subtype.prototype instanceof Serializeable)) throw new TypeError("Given data subtype is not serializeable.");
        let inst = new subtype() as this;
        //this.entry = inst;
        return inst;
    }

    public toJSON(){
        
    }
}