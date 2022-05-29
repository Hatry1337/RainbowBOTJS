import ItemStack from "../ItemStack";
import Player from "../Player";
import Item from "./Item";
import ItemUsable from "./ItemUsable";

export class ItemPoints extends ItemUsable {
    constructor(item: Item, public ammount: number){
        super(item);
    }

    public canUse(itemStack: ItemStack, player: Player): boolean {
        return itemStack.size > 0;
    }

    public async use(itemStack: ItemStack, player: Player) {
        if(itemStack.size <= 0) return player.updateInventory();

        player.user.economy.points += this.ammount;
        itemStack.size -= 1;
        player.updateInventory();
    }
}