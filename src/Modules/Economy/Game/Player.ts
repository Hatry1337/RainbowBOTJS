import { User } from "synergy3";
import IPlayerObject from "./Interfaces/IPlayerObject";
import ItemStack from "./ItemStack";
import Room from "./Room";

export default class Player {
    public inventory: ItemStack[] = [];
    public rooms: Room[] = [];
    constructor(public user: User){

    }

    public updateInventory() {
        for(let i = 0; i < this.inventory.length; i++){
            if(this.inventory[i].size <= 0){
                this.inventory.splice(i, 1);
            }
        }
    }

    public toObject(): IPlayerObject{
        return {
            userId: this.user.id,
            inventory: this.inventory.map(i => i.toObject()),
            rooms: this.rooms.map(r => r.toObject())
        }
    }
}