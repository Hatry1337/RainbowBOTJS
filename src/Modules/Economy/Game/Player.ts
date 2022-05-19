import { User } from "synergy3";
import IPlayerObject from "./Interfaces/IPlayerObject";
import ItemStack from "./ItemStack";
import Room from "./Room";

export default class Player {
    public inventory: ItemStack[] = [];
    public rooms: Room[] = [];
    constructor(public user: User){

    }

    public toObject(): IPlayerObject{
        return {
            userId: this.user.id,
            inventory: this.inventory.map(i => ({ itemId: i.item.id, size: i.size, uuid: i.uuid })),
            rooms: this.rooms.map(r => r.toObject())
        }
    }
}