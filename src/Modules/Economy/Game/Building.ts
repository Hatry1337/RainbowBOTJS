import IRoomObject from "./Interfaces/IRoomObject";
import ItemPlaceable from "./Items/ItemPlaceable";
import ItemPowerConsumer from "./Items/ItemPowerConsumer";
import ItemBuilding from "./Items/ItemBuilding";
import ItemStack from "./ItemStack";

export default class Building {
    public placedItems: ItemStack<ItemPlaceable>[] = [];
    constructor(public readonly reference: ItemBuilding){
        
    }

    public getUsedSlots(){
        return this.placedItems.reduce((acc, stack) => { 
            return acc += (stack.item.sizeSlots * stack.size);
        }, 0);
    }

    public getPowerConsumers(){
        return this.placedItems.filter(i => i.item instanceof ItemPowerConsumer) as ItemStack<ItemPowerConsumer>[];
    }

    public getPowerUsage(){
        let consumers = this.getPowerConsumers();
        return consumers.reduce((acc, stack) => {
            return acc += (stack.item.powerConsumption * stack.size);
        }, 0);
    }

    public placeItem(stack: ItemStack<ItemPlaceable>){
        if(this.getUsedSlots() + (stack.item.sizeSlots * stack.size) > this.reference.size){
            return -1;
        }
        if(stack.item instanceof ItemPowerConsumer){
            if(stack.item.powerConsumption * stack.size > this.reference.powerGrid){
                return -1;
            }
        }
        return this.placedItems.push(stack) - 1;
    }

    public removeItem(index: number): ItemStack<ItemPlaceable> | undefined {
        return this.placedItems.splice(index, 1)[0];
    }

    public toObject(): IRoomObject {
        return {
            referenceId: this.reference.id,
            placedItems: this.placedItems.map(i => i.toObject())
        }
    }
}