import { Synergy } from "synergy3";
import ShopEntry from "./ShopEntry";
import ItemStack from "../Game/ItemStack";
import Player from "../Game/Player";
import UTS from "../../UnifiedTestSuite/UTS";
import { StorageWrapper } from "../Storage/StorageWrapper";
import ItemMiner from "../Game/Items/ItemMiner";
import { ItemsRegistry } from "../Game/Items/ItemsRegistry";

export interface IShopCategory {
    name: string;
    entries: ShopEntry[];
}
export default class Shop {
    public categories: IShopCategory[] = [];
    private watchTimer: NodeJS.Timeout;
    private lastChecked: Date = new Date;
    constructor(public bot: Synergy, public storage: StorageWrapper){
        this.watchTimer = setInterval(async () => {
            let cd = new Date();
            if(cd.getDate() !== this.lastChecked.getDate()){
                this.makeMagic();
            }
            this.lastChecked = cd;
            await this.storage.saveShopInfo(this.getItems(), this.lastChecked);
        }, 60000);

        this.bot.events.once("Stop", () => {
            clearInterval(this.watchTimer);
        });

        this.categories.push(
            {
                name: "Regular Miners",
                entries: [
                    new ShopEntry(new ItemStack(ItemsRegistry.getItem("miners_laptop")!, 1))
                        .setMinPrice(300)
                        .setMinStock(10)
                        .setMaxStock(30),

                    new ShopEntry(new ItemStack(ItemsRegistry.getItem("miners_desktop_pc")!, 1))
                        .setMinPrice(1000)
                        .setMinStock(8)
                        .setMaxStock(35),

                    new ShopEntry(new ItemStack(ItemsRegistry.getItem("miners_server_unit")!, 1))
                        .setMinPrice(5000)
                        .setMinStock(5)
                        .setMaxStock(25),

                    new ShopEntry(new ItemStack(ItemsRegistry.getItem("miners_server_rack")!, 1))
                        .setMinPrice(40500)
                        .setMinStock(3)
                        .setMaxStock(20),
                ]
            },
            {
                name: "ASIC Miners",
                entries: [
                    new ShopEntry(new ItemStack(ItemsRegistry.getItem("miners_asic_ign0")!, 1))
                        .setMinPrice(1000000)
                        .setMinStock(3)
                        .setMaxStock(20),
                        
                    new ShopEntry(new ItemStack(ItemsRegistry.getItem("miners_asic_ign4")!, 1))
                        .setMinPrice(8000000)
                        .setMinStock(3)
                        .setMaxStock(20),
                ]
            },
            {
                name: "Mining Facilities",
                entries: [
                    new ShopEntry(new ItemStack(ItemsRegistry.getItem("miners_facil_server_rack")!, 1))
                        .setMinPrice(50000000)
                        .setMinStock(3)
                        .setMaxStock(15),

                    new ShopEntry(new ItemStack(ItemsRegistry.getItem("miners_facil_asic_ign0")!, 1))
                        .setMinPrice(600000000)
                        .setMinStock(1)
                        .setMaxStock(10),

                    new ShopEntry(new ItemStack(ItemsRegistry.getItem("miners_facil_asic_ign4")!, 1))
                        .setMinPrice(4500000000)
                        .setMinStock(1)
                        .setMaxStock(5),
                ]
            },
            {
                name: "Groups",
                entries: [
                    new ShopEntry(new ItemStack(ItemsRegistry.getItem("groups_premium_1")!,  1))
                        .setMinPrice(20000000)
                        .setMinStock(100)
                        .setMaxStock(500),

                    new ShopEntry(new ItemStack(ItemsRegistry.getItem("groups_premium_7")!,  1))
                        .setMinPrice(120000000)
                        .setMinStock(100)
                        .setMaxStock(500),

                    new ShopEntry(new ItemStack(ItemsRegistry.getItem("groups_premium_30")!, 1))
                        .setMinPrice(550000000)
                        .setMinStock(100)
                        .setMaxStock(500),
                ]
            }
        )

        UTS.addTestPoint("economy.shop.nextday", "skip one day", async (int) => {
            this.makeMagic();
        });
    }

    public async Init(){
        let data = await this.storage.getShopData();
        if(!data){
            await this.storage.saveShopInfo(this.getItems(), this.lastChecked);
        }else{
            let items = this.getItems();
            for(let i of items){
                let d = data.items.find(d => d.itemId === i.item.item.id);
                if(!d) continue;
                i.price = d.price;
                i.stock = d.stock;
                i.excessCombo = d.excessCombo;
                i.shortageCombo = d.shortageCombo;
            }
        }
    }

    public getItems(){
        let items: ShopEntry[] = [];
        for(let c of this.categories){
            items = items.concat(c.entries);
        }
        return items;
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
        
        let stack = item.item.copy().setSize(item.item.size * count);

        stack = this.postBuyHooks(player, stack);

        player.tryStackItem(stack);
        return 1;
    }

    private postBuyHooks(player: Player, item: ItemStack){
        if(item.item instanceof ItemMiner){
            item.meta.lastRedeem = new Date();
        }
        return item;
    }
}