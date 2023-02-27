/* #TODO maybe :p
import { GrpMgrSharedMethods } from "../../../GrpMgr/GrpMgr";
import ItemStack from "../ItemStack";
import Player from "../Player";
import ItemUsable from "./ItemUsable";

export class ItemLootBox extends ItemUsable {
    public items: [ItemStack, number][] = [];

    constructor(id: string){
        super(id);
    }

    public addItem(item: ItemStack, rareness: number){
        this.items.push([item, rareness]);
        return this;
    }

    public rmItem(index: number){
        this.items.splice(index);
        return this;
    }

    public canUse(itemStack: ItemStack, player: Player): boolean {
        return itemStack.size > 0;
    }

    public async use(itemStack: ItemStack, player: Player) {
        if(itemStack.size <= 0) return player.updateInventory();

        if(this.time <= 0){
            player.user.groups.push(this.group);
        }else{
            let methods = player.user.bot.modules.GetModuleCommonInfo("GrpMgr")[0].sharedMethods as unknown as GrpMgrSharedMethods;
            await methods.addTempGroup(this.group, player.user, this.time);
        }
        
        itemStack.size -= 1;
        player.updateInventory();
    }
}
*/