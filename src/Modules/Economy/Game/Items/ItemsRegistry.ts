import Item from "./Item";
import { ItemGroup } from "./ItemGroup";
import { DesktopPC } from "./Miners/DesktopPC";
import { IGN0 } from "./Miners/IGN0";
import { IGN4 } from "./Miners/IGN4";
import { Laptop } from "./Miners/Laptop";
import { MiningFacility } from "./Miners/MiningFacility";
import { ServerRack } from "./Miners/ServerRack";
import { ServerUnit } from "./Miners/ServerUnit";

const ItemsMap: Map<string, Item> = new Map();

export class ItemsRegistry {
    public static registerItem(item: Item){
        this.registerItemDirect(item.id, item);
    }

    public static registerItemDirect(id: string, item: Item){
        ItemsMap.set(id, item);
    }

    public static getItem(id: string){
        return ItemsMap.get(id);
    }

    public static registerItems(){
        let laptop     = new Laptop("miners_laptop");
        this.registerItem(laptop);

        let desk_pc    = new DesktopPC("miners_desktop_pc");
        this.registerItem(desk_pc);

        let svunit     = new ServerUnit("miners_server_unit");
        this.registerItem(svunit);

        let svrack     = new ServerRack("miners_server_rack");
        this.registerItem(svrack);

        let ign0       = new IGN0("miners_asic_ign0");
        this.registerItem(ign0);

        let ign4       = new IGN4("miners_asic_ign4");
        this.registerItem(ign4);

        let facil_svr  = new MiningFacility<ServerRack>("miners_facil_server_rack", svrack, 1000);
        this.registerItem(facil_svr);

        let facil_ign0 = new MiningFacility<IGN0>("miners_facil_asic_ign0", ign0, 500);
        this.registerItem(facil_ign0);

        let facil_ign4 = new MiningFacility<IGN4>("miners_facil_asic_ign4", ign4, 500)
        this.registerItem(facil_ign4);

        //GROUPS
        let grp_premium1  = new ItemGroup("groups_premium_1") 
                                .setName("Premium Group 1 day")
                                .setDescription("This item after usage gaves you 1 day of premium group.")
                                .setSellable(false)
                                .setTradeable(true)
                                .setGroup("premium")
                                .setTime(24 * 60 * 60);
        this.registerItem(grp_premium1);
    
        let grp_premium7  = new ItemGroup("groups_premium_7") 
                                .setName("Premium Group 7 day")
                                .setDescription("This item after usage gaves you 7 day of premium group.")
                                .setSellable(false)
                                .setTradeable(true)
                                .setGroup("premium")
                                .setTime(7 * 24 * 60 * 60);
        this.registerItem(grp_premium7);
        
        let grp_premium30 = new ItemGroup("groups_premium_30") 
                                .setName("Premium Group 30 days")
                                .setDescription("This item after usage gaves you 30 days of premium group.")
                                .setSellable(false)
                                .setTradeable(true)
                                .setGroup("premium")
                                .setTime(30 * 24 * 60 * 60);        
        this.registerItem(grp_premium30);
    }
}

ItemsRegistry.registerItems();