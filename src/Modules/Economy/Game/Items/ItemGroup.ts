import { GrpMgrSharedMethods } from "../../../GrpMgr/GrpMgr";
import ItemStack from "../ItemStack";
import Player from "../Player";
import ItemUsable from "./ItemUsable";

export class ItemGroup extends ItemUsable {
    public group: string = "player";
    public time: number = -1; 
    constructor(id: string){
        super(id);
    }

    public setGroup(group: string){
        this.group = group;
        return this;
    }

    public setTime(time: number){
        this.time = time;
        return this;
    }

    public canUse(itemStack: ItemStack, player: Player): boolean {
        return itemStack.size > 0 && !player.user.groups.includes(this.group);
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