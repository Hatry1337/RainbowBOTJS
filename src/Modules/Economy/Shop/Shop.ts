import { Colors, Synergy, SynergyUserError, User } from "synergy3";
import ShopEntry from "./ShopEntry";
import Discord from "discord.js";
import ItemStack from "../Game/ItemStack";
import { ItemsMap } from "../Game/Items/ItemsMap";
import Player from "../Game/Player";
import UTS from "../../UnifiedTestSuite/UTS";
import { CEmojis } from "../../../RainbowBOTUtils";
import { StorageWrapper } from "../Storage/StorageWrapper";

export interface IShopCategory {
    name: string;
    entries: ShopEntry[];
}

export default class Shop {
    public categories: IShopCategory[] = [];
    private watchTimer: NodeJS.Timeout;
    private lastChecked: Date = new Date;
    constructor(public bot: Synergy, public storage: StorageWrapper){
        this.watchTimer = setInterval(() => {
            let cd = new Date();
            if(cd.getDate() !== this.lastChecked.getDate()){
                this.makeMagic();
            }
            this.lastChecked = cd;
        }, 60000);

        this.bot.events.once("Stop", () => {
            clearInterval(this.watchTimer);
        });

        this.categories.push(
            {
                name: "Miners",
                entries: [
                    new ShopEntry(new ItemStack(ItemsMap.get(4)!, 1), 2, 10, 30)
                ]
            },
            {
                name: "Rooms",
                entries: [
                    new ShopEntry(new ItemStack(ItemsMap.get(3)!, 1), 10, 3, 10)
                ]
            }
        )

        UTS.addTestPoint("economy.shop.nextday", "skip one day", async (int) => {
            this.makeMagic();
        });
    }

    private makeMagic() {
        for(let c of this.categories){
            for(let i of c.entries){
                i.calculate();
                i.refill();
            }
        }
    }

    /**
     * `-1` - Not enough item stock
     * `-2` - Not enough points on player balance
     * `1` - Purchased successfully
     */
    public buy(player: Player, category: number, entry: number, count: number = 1){
        let item = this.categories[category].entries[entry];
        
        if(item.stock < item.item.size * count) return -1;
        if(item.price * count > player.user.economy.points) return -2;

        item.stock -= item.item.size * count;
        player.user.economy.points -= item.price * count;
        
        let stackflag = false;
        for(let i of player.inventory){
            if(i.item.id === item.item.item.id){
                i.size += item.item.size * count;
                stackflag = true;
                break;
            }
        }
        if(!stackflag){
            player.inventory.push(item.item.copy().setSize(item.item.size * count));
        }
        return 1;
    }
}