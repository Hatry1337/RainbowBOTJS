import Item from "./Item";
import ItemStack from "../ItemStack";
import Player from "../Player";

export default abstract class ItemUsable extends Item {
    constructor(id: string){
        super(id);
        this.is_usable = true;
    }

    public abstract canUse(itemStack: ItemStack, player: Player): boolean;
    public abstract use(itemStack: ItemStack, player: Player): Promise<void>;
}