import Item from "./Items/Item";
import crypto from "crypto";

export default class ItemStack<T extends Item = Item> {
    public uuid: string;
    constructor(public item: T, public size: number, uuid?: string){
        this.uuid = uuid  || crypto.randomUUID();
    }
}