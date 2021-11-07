import { Item } from "./Items/Item";
import { ItemCoal } from "./Items/ItemCoal";
import { ItemCopperIngot } from "./Items/ItemCopperIngot";
import { ItemCopperOre } from "./Items/ItemCopperOre";
import { ItemDirt } from "./Items/ItemDirt";
import { ItemFurnace } from "./Items/ItemFurnace";
import { ItemGoldIngot } from "./Items/ItemGoldIngot";
import { ItemGoldOre } from "./Items/ItemGoldOre";
import { ItemIronIngot } from "./Items/ItemIronIngot";
import { ItemIronOre } from "./Items/ItemIronOre";
import { ItemStick } from "./Items/ItemStick";
import { ItemStone } from "./Items/ItemStone";
import { ItemTinIngot } from "./Items/ItemTinIngot";
import { ItemTinOre } from "./Items/ItemTinOre";
import { ItemWood } from "./Items/ItemWood";

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
}

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