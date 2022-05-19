import { randomUUID } from "crypto";
import { ClassDef } from "../ClassDef";
import { IDataSerialized, Serializeable } from "../Serializer/Serializeable";
import { RegistryEntry } from "./RegistryEntry";

export interface ISerializedRegistry{
    name: string;
    entries: [uuid: string, entry: any][];
}

export class RegistryBase<T extends RegistryEntry> extends Serializeable{
    private data: Map<string, T> = new Map();
    constructor(private name: string, readonly proto: T){
        super();
    }

    public getName(){
        return this.name;
    }

    public addEntry(entry: T){
        let uuid = randomUUID();
        this.data.set(uuid, entry);
        return uuid;
    }

    public deleteEntry(uuid: string){
        this.data.delete(uuid);
    }

    public getEntry(uuid: string){
        return this.data.get(uuid);
    }

    public clear(){
        this.data.clear();
    }

    public getEntryes(){
        return Array.from(this.data.entries()).map(e => ({ uuid: e[0], entry: e[1] }));
    }

    public serialize(){
        let data: IDataSerialized<ISerializedRegistry> = {
            type: this.constructor.name,
            subtype: this.proto.constructor.name,
            data: {
                name: this.name,
                entries: Array.from(this.data.entries()).map(e => [e[0], e[1].serialize()]) as [uuid: string, entry: any][]
            }
        };
        return data;
    }

    public static deserialize(data: IDataSerialized<ISerializedRegistry>){
        if(data.type !== this.constructor.name) throw new TypeError(`Given data is not type of ${this.constructor.name}.`);
        if(!data.subtype) throw new TypeError("This type must have a subtype.");

        let subtype = ClassDef.find(c => c?.name === data.subtype);
        if(!subtype) throw new TypeError("Given data subtype is not defined in ClassDef.");

        if(!(subtype.prototype instanceof RegistryEntry)) throw new TypeError("Given data subtype is not RegistryEntry.");
        
        this.name = data.data.name;
        this.data.clear();

        let proto = subtype.prototype;

        for(let e of data.data.entries){
            this.data.set(e[0], subtype.deserialize(e[1]) as T);
        }
        return this;
    }
}