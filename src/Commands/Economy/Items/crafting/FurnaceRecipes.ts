import { ItemStack } from "../ItemStack";
import log4js from "log4js";
import { Item } from "../Item";
import { Items } from "../Items";

const logger = log4js.getLogger("economy");

export class FurnaceRecipes{
    private static SMELTING_BASE: FurnaceRecipes = new FurnaceRecipes();
    public smeltingList: Map<ItemStack, ItemStack> = new Map();
    public customRecipes: Map<ItemStack, ItemStack> = new Map();

    constructor(){
        this.addSmelting(Items.IRON_ORE, new ItemStack(Items.IRON_INGOT));
        this.addSmelting(Items.COPPER_ORE, new ItemStack(Items.COPPER_INGOT));
        this.addSmelting(Items.TIN_ORE, new ItemStack(Items.TIN_INGOT));
        this.addSmelting(Items.GOLD_ORE, new ItemStack(Items.GOLD_INGOT));
    }

    public static instance(): FurnaceRecipes{
        return FurnaceRecipes.SMELTING_BASE;
    }

    public registerRecipe(itemstack: ItemStack, itemstack1: ItemStack): void {
        this.customRecipes.set(itemstack, itemstack1);
    }

    public addSmeltingRecipe(input: ItemStack, stack: ItemStack) {
        if (this.getSmeltingResult(input) !== ItemStack.EMPTY) {
            logger.info("Ignored smelting recipe with conflicting input:", input, "=", stack);
            return;
        }
        this.smeltingList.set(input, stack);
    }

    public addSmelting(input: Item, stack: ItemStack) {
        this.addSmeltingRecipe(new ItemStack(input, 1), stack);
    }

    public getSmeltingResult(stack: ItemStack): ItemStack {
        if(this.customRecipes){
            for (var entry of this.customRecipes.entries()) {
                if (this.compareItemStacks(stack, entry[0])) {
                    return entry[1];
                }
            }
        }

        if(this.smeltingList){
            for (var entry of this.smeltingList.entries()) {
                if (this.compareItemStacks(stack, entry[0])) {
                    return entry[1];
                }
            }
        }

        return ItemStack.EMPTY;
    }

    public getSmeltingList(): Map<ItemStack, ItemStack> {
        return this.smeltingList;
    }

    private compareItemStacks(stack1: ItemStack, stack2: ItemStack): boolean {
        return stack1.isItemEqual(stack2) && ItemStack.areItemStackMetaEqual(stack1, stack2);
    }
}