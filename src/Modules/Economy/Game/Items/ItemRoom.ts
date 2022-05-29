import ItemStack from "../ItemStack";
import Player from "../Player";
import Room from "../Room";
import Item from "./Item";
import ItemUsable from "./ItemUsable";

export default class ItemRoom extends ItemUsable {
    constructor(item: Item, public powerGrid: number, public slots: number, public weeklyFee: number){
        super(item);
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