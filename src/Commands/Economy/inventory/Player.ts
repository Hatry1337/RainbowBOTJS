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

    public addAndStackItem(item: ItemStack){
        var stack = this.inventory.find(i => i.isItemEqual(item) && i.getCount() !== i.getMaxStackSize());
        if(stack){
            var delta = stack.getMaxStackSize() - stack.getCount();
            if(delta >= item.getCount()){
                stack.grow(item.getCount());
            }else{
                stack.grow(delta);
                item.shrink(delta);
                this.addItem(item);
            }
        }else{
            this.addItem(item);
        }
    }

    public inventRestack(){
        for(let i of this.inventory){
            var stack = this.inventory.find(f => f.isItemEqual(i) && f !== i && f.getCount() !== f.getMaxStackSize());
            if(stack){
                var delta = stack.getMaxStackSize() - stack.getCount();
                if(delta >= i.getCount()){
                    stack.grow(i.getCount());
                    this.delItem(i);
                }else{
                    stack.grow(delta);
                    i.shrink(delta);
                }
            }
        }
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