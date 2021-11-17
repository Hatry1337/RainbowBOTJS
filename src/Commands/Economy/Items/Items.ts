import { Item } from "./Item";
import { ItemChest } from "./ItemChest";
import { ItemFurnace } from "./ItemFurnace";
import { ItemIngotBase } from "./ItemIngotBase";
import { ItemOreBase } from "./ItemOreBase";
import { ItemTPSMeter } from "./ItemTPSMeter";

export class Items{
    public static STONE: Item          = new Item("Stone", "Just a piece of stone.");
    public static DIRT: Item           = new Item("Dirt", "I think you can build a house of this.");
    public static COAL: Item           = new Item("Coal", "Basic fuel. Burn cool.");
    public static WOOD: Item           = new Item("Wood", "Crafting item. Can be used as fuel. Burn not cool.");
    public static STICK: Item          = new Item("Stick", "Crafting item. Also can be used as fuel. Burn NOT cool.");
    
    public static IRON_ORE: Item       = new ItemOreBase("Iron Ore", "Raw iron ore.");
    public static COPPER_ORE: Item     = new ItemOreBase("Copper Ore", "Raw copper ore.");
    public static TIN_ORE: Item        = new ItemOreBase("Tin Ore", "Raw tin ore.");
    public static GOLD_ORE: Item       = new ItemOreBase("Gold Ore", "Raw gold ore.");

    public static IRON_INGOT: Item     = new ItemIngotBase("Iron Ingot", "Processed iron. Ready to crafting!");
    public static COPPER_INGOT: Item   = new ItemIngotBase("Copper Ingot", "Processed copper. Ready to crafting!");
    public static TIN_INGOT: Item      = new ItemIngotBase("Tin Ingot", "Processed tin. Ready to crafting!");
    public static GOLD_INGOT: Item     = new ItemIngotBase("Gold Ingot", "Processed gold. Ready to crafting!");
    public static BRONZE_INGOT: Item   = new ItemIngotBase("Bronze Ingot", "Alloy of tin and copper. More harder than regular tin.");

    public static FURNACE: Item        = new ItemFurnace;
    public static TPS_METER: Item      = new ItemTPSMeter;
    public static CHEST: Item          = new ItemChest;

    static {
        Item.REGISTRY.registerItem("stone", Items.STONE);
        Item.REGISTRY.registerItem("dirt", Items.DIRT);
        Item.REGISTRY.registerItem("coal", Items.COAL);
        Item.REGISTRY.registerItem("wood", Items.WOOD);
        Item.REGISTRY.registerItem("stick", Items.STICK);
        
        Item.REGISTRY.registerItem("iron_ore", Items.IRON_ORE);
        Item.REGISTRY.registerItem("copper_ore", Items.COPPER_ORE);
        Item.REGISTRY.registerItem("tin_ore", Items.TIN_ORE);
        Item.REGISTRY.registerItem("gold_ore", Items.GOLD_ORE);
        
        Item.REGISTRY.registerItem("iron_ingot", Items.IRON_INGOT);
        Item.REGISTRY.registerItem("copper_ingot", Items.COPPER_INGOT);
        Item.REGISTRY.registerItem("gold_ingot", Items.GOLD_INGOT);
        Item.REGISTRY.registerItem("bronze_ingot", Items.BRONZE_INGOT);
        
        Item.REGISTRY.registerItem("furnace", Items.FURNACE);
        Item.REGISTRY.registerItem("tpsmeter", Items.TPS_METER);
        Item.REGISTRY.registerItem("chest", Items.CHEST);
    }
}