export interface IDataSerialized<T = any>{
    type: string;
    subtype?: string;
    data: T;
}

export abstract class Serializeable{
    public abstract serialize(): IDataSerialized;
    public abstract deserialize(data: IDataSerialized): typeof this;
}