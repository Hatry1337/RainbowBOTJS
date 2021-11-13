import { MPlayer } from "../../../Models/Economy/MPlayer";
import { User } from "../../../Models/User";
import { IISObject, ItemStack } from "../Items/ItemStack";

export class Player{
    private inventory: ItemStack[];
    private user: User;
    private mpl: MPlayer;

    constructor(mplr: MPlayer, inventory?: ItemStack[]){
        this.mpl = mplr;
        this.user = mplr.User;
        this.inventory = inventory || mplr.getInventory();
    }

    public static async createOrLoadFromStorage(id: string){
        var mpl = await MPlayer.findOrCreate({
            where: {
                userID: id
            },
            defaults: {
                userID: id,
                inventory: []
            },
            include: [User]
        });
        return new Player(mpl[0]);
    }

    public static async createOrLoadFromStorageSafe(id: string){
        var u = await User.findOne({
            where:{
                ID: id
            }
        });
        if(!u){
            return;
        }
        var mpl = await MPlayer.findOrCreate({
            where: {
                userID: id
            },
            defaults: {
                userID: id,
                inventory: []
            },
            include: [User]
        });
        return new Player(mpl[0]);
    }

    public async saveToStorage(){
        this.mpl.setInventory(this.inventory);
        await this.mpl.save();
    }

    public getInventory(){
        return this.inventory;
    }

    public addItem(item: ItemStack){
        this.inventory.push(item);
    }

    public delItem(item: ItemStack){
        var i = this.inventory.indexOf(item);
        if(i !== -1){
            this.inventory.splice(i, 1);
        }
    }

    public getUser(){
        return this.user;
    }
}