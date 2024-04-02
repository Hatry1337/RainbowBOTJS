import { User } from "synergy3";
import IPlayerObject from "./Interfaces/IPlayerObject";
import ItemStack from "./ItemStack";
import _ from "lodash";
import Building from "./Building";

export default class Player {
    public inventory: ItemStack[] = [];
    public buildings: Building[] = [];
    constructor(public user: User){

    }

    public updateInventory() {
        for(let i = 0; i < this.inventory.length; i++){
            if(this.inventory[i].size <= 0){
                this.inventory.splice(i, 1);
            }
        }
    }

    public canStackItem(item: ItemStack){
        let stackflag = false;
        for(let i of this.inventory){
            if(i.item.id === item.item.id && _.isEqual(i.meta, item.meta)){
                stackflag = true;
                break;
            }
        }
        return stackflag;
    }

    /**
     * Tryes to stack target item with same item in inventory
     * @returns 
     */
    public tryStackItem(item: ItemStack){
        let stackflag = false;
        for(let i of this.inventory){
            if(i.item.id === item.item.id && _.isEqual(i.meta, item.meta)){
                i.size += item.size;
                stackflag = true;
                break;
            }
        }
        if(!stackflag){
            this.inventory.push(item);
        }
        return stackflag;
    }

    public deleteItem(item: ItemStack){
        let index = this.inventory.indexOf(item);
        return this.inventory.splice(index, 1)[0];
    }

    public restackInventory(){
        let items = _.clone(this.inventory);
        let item;
        while(item = items.pop()){
            this.deleteItem(item);
            this.tryStackItem(item);
        }
    }

    public toObject(): IPlayerObject{
        return {
            userId: this.user.unifiedId,
            userDiscordId: this.user.discord?.id,
            inventory: this.inventory.map(i => i.toObject()),
            rooms: this.buildings.map(r => r.toObject())
        }
    }
}