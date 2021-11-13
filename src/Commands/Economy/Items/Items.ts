import { Item } from "./Item";
import { ItemCoal } from "./ItemCoal";
import { ItemCopperIngot } from "./ItemCopperIngot";
import { ItemCopperOre } from "./ItemCopperOre";
import { ItemDirt } from "./ItemDirt";
import { ItemFurnace } from "./ItemFurnace";
import { ItemGoldIngot } from "./ItemGoldIngot";
import { ItemGoldOre } from "./ItemGoldOre";
import { ItemIronIngot } from "./ItemIronIngot";
import { ItemIronOre } from "./ItemIronOre";
import { ItemStick } from "./ItemStick";
import { ItemStone } from "./ItemStone";
import { ItemTinIngot } from "./ItemTinIngot";
import { ItemTinOre } from "./ItemTinOre";
import { ItemTPSMeter } from "./ItemTPSMeter";
import { ItemWood } from "./ItemWood";

export class Items{
    public static STONE: Item        = new ItemStone;
    public static DIRT: Item         = new ItemDirt;
    public static COAL: Item         = new ItemCoal;
    public static WOOD: Item         = new ItemWood;
    public static STICK: Item        = new ItemStick;
    
    public static IRON_ORE: Item     = new ItemIronOre;
    public static COPPER_ORE: Item   = new ItemCopperOre;
    public static TIN_ORE: Item      = new ItemTinOre;
    public static GOLD_ORE: Item     = new ItemGoldOre;

    public static IRON_INGOT: Item   = new ItemIronIngot;
    public static COPPER_INGOT: Item = new ItemCopperIngot;
    public static TIN_INGOT: Item    = new ItemTinIngot;
    public static GOLD_INGOT: Item   = new ItemGoldIngot;

    public static FURNACE: Item      = new ItemFurnace;
    public static TPS_METER: Item      = new ItemTPSMeter;

    static {
        Item.REGISTRY.registerItem("stone", Items.STONE);
        Item.REGISTRY.registerItem("dirt", Items.DIRT);
        Item.REGISTRY.registerItem("coal", Items.COAL);
        Item.REGISTRY.registerItem("wood", Items.WOOD);
        
        Item.REGISTRY.registerItem("iron_ore", Items.IRON_ORE);
        Item.REGISTRY.registerItem("copper_ore", Items.COPPER_ORE);
        Item.REGISTRY.registerItem("tin_ore", Items.TIN_ORE);
        Item.REGISTRY.registerItem("gold_ore", Items.GOLD_ORE);
        
        Item.REGISTRY.registerItem("iron_ingot", Items.IRON_INGOT);
        Item.REGISTRY.registerItem("copper_ingot", Items.COPPER_INGOT);
        Item.REGISTRY.registerItem("gold_ingot", Items.GOLD_INGOT);
        
        Item.REGISTRY.registerItem("furnace", Items.FURNACE);
        Item.REGISTRY.registerItem("tpsmeter", Items.TPS_METER);
    }
}