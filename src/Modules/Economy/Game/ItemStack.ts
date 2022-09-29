import Item from "./Items/Item";
import crypto from "crypto";
import IItemStackObject from "./Interfaces/IItemStackObject";

export default class ItemStack<T extends Item = Item> {
    public uuid: string;

    constructor(public item: T, public size: number, uuid?: string, public meta: { [key: string]: any }  = {}){
        this.uuid = uuid  || crypto.randomUUID();
    }

    public setMeta(meta: { [key: string]: any }){
        this.meta = meta;
        return this;
    }

    public setSize(size: number){
        this.size = size;
        return this;
    }

    public setItem(item: T){
        this.item = item;
        return this;
    }

    public setUUID(uuid: string){
        this.uuid = uuid;
        return this;
    }

    public copy(){
        return new ItemStack(this.item, this.size, undefined, this.meta);
    }

    public toObject(): IItemStackObject {
        return {
            itemId: this.item.id,
            size: this.size,
            uuid: this.uuid,
            meta: this.meta
        }
    }
}