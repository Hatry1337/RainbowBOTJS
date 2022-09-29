import ItemStack from "../ItemStack";
import Player from "../Player";
import Room from "../Room";
import ItemUsable from "./ItemUsable";

export default class ItemRoom extends ItemUsable {
    public powerGrid: number = 1000;
    public slots: number = 10;
    public weeklyFee: number = 5000;

    constructor(id: string){
        super(id);
    }

    public setPowerGrid(powerGrid: number){
        this.powerGrid = powerGrid;
        return this;
    }

    public setSlots(slots: number){
        this.slots = slots;
        return this;
    }

    public setWeeklyFee(weeklyFee: number){
        this.weeklyFee = weeklyFee;
        return this;
    }

    public canUse(itemStack: ItemStack, player: Player): boolean {
        return itemStack.size > 0;
    }

    public async use(itemStack: ItemStack, player: Player) {
        if(itemStack.size <= 0) return player.updateInventory();

        player.rooms.push(new Room(this));
        itemStack.size -= 1;
        player.updateInventory();
    }
}