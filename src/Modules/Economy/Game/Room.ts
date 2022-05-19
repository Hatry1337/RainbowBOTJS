import IRoomObject from "./Interfaces/IRoomObject";
import ItemPlaceable from "./Items/ItemPlaceable";
import ItemRoom from "./Items/ItemRoom";
import ItemStack from "./ItemStack";

export default class Room {
    public placedItems: ItemStack<ItemPlaceable>[] = [];
    constructor(public readonly reference: ItemRoom){
        
    }

    public getUsedSlots(){
        return this.placedItems.reduce((acc, stack) => { 
            return acc += (stack.item.sizeSlots * stack.size);
        }, 0);
    }

    public placeItem(stack: ItemStack<ItemPlaceable>){
        if(this.getUsedSlots() + (stack.item.sizeSlots * stack.size) > this.reference.slots){
            return -1;
        }
        return this.placedItems.push(stack) - 1;
    }

    public removeItem(index: number): ItemStack<ItemPlaceable> | undefined {
        return this.placedItems.splice(index, 1)[0];
    }

    public toObject(): IRoomObject {
        return {
            referenceId: this.reference.id,
            placedItems: this.placedItems.map(i => ({ itemId: i.item.id, size: i.size, uuid: i.uuid }))
        }
    }
}