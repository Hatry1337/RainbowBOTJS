import ItemStack from "../ItemStack";
import Player from "../Player";
import ItemUsable from "./ItemUsable";

export class ItemPoints extends ItemUsable {
    public pointsAmount: number = 10;

    constructor(id: string){
        super(id);
    }

    public setPointsAmount(pointsAmount: number){
        this.pointsAmount = pointsAmount;
        return this;
    }

    public canUse(itemStack: ItemStack, player: Player): boolean {
        return itemStack.size > 0;
    }

    public async use(itemStack: ItemStack, player: Player) {
        if(itemStack.size <= 0) return player.updateInventory();

        player.user.economy.points += this.pointsAmount;
        itemStack.size -= 1;
        player.updateInventory();
    }
}