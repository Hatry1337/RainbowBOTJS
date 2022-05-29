import ItemStack from "../ItemStack";
import Player from "../Player";
import Item from "./Item";

export default abstract class ItemUsable extends Item {
    constructor(item: Item){
        super(item.id, item.name, item.description, item.isSellable(), item.isTradeable());
        this.is_usable = true;
    }

    public abstract canUse(itemStack: ItemStack, player: Player): boolean;
    public abstract use(itemStack: ItemStack, player: Player): Promise<void>;
}