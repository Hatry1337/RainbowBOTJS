import { Item } from "./Item";

export interface IItemStackMeta{
    [key: string]: object;
}

export class ItemStack{
    private stackSize: number;
    private item: Item;
    private meta: IItemStackMeta = {};

    constructor(item: Item, count: number = 1, meta: IItemStackMeta = {}){
        this.item = item;
        this.stackSize = count;
        this.meta = meta;
    }

    public static EMPTY = new ItemStack(null!);

    public isEmpty(): boolean {
        if (this === ItemStack.EMPTY) {
            return true;
        } else if (this.getItem() !== null) {
            return this.stackSize <= 0;
        } else {
            return true;
        }
    }

    public isItemEqual(other: ItemStack): boolean {
        return !other.isEmpty() && this.item == other.item;
    }

    public static areItemStackMetaEqual(stackA: ItemStack, stackB: ItemStack): boolean {
        if (stackA.isEmpty() && stackB.isEmpty()) {
            return true;
        } else if (!stackA.isEmpty() && !stackB.isEmpty()) {
            return stackA.meta === stackB.meta;
        } else {
            return false;
        }
    }

    public getMaxStackSize(): number {
        return this.getItem().getMaxStackSize();
    }

    public getItem(): Item{
        return this.item;
    }
    public setItem(item: Item): ItemStack{
        this.item = item;
        return this;
    }

    public getCount(): number{
        return this.stackSize;
    }
    public setCount(size: number): ItemStack{
        this.stackSize = size;
        return this;
    }

    public getMeta(): object{
        return this.meta || {};
    }
    public setMeta(meta: IItemStackMeta): ItemStack{
        this.meta = meta || {};
        return this;
    }
    public setMetaField(field: string, value: object): ItemStack{
        this.meta[field] = value;
        return this;
    }
    public getMetaField(field: string): object{
        return this.meta[field]; 
    }

    public copy(): ItemStack{
        return new ItemStack(this.item, this.stackSize, this.meta);
    }

    public grow(count: number){
        this.setCount(this.stackSize + count);
    }

    public shrink(count: number){
        this.grow(-count);
    }

    public splitStack(count: number): ItemStack{
        var i = Math.min(count, this.stackSize);
        var itemstack = this.copy();
        itemstack.setCount(i);
        this.shrink(i);
        return itemstack;
    }

}