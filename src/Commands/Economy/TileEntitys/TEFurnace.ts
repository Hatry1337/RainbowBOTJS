import { ItemStackHelper } from "../inventory/ItemStackHelper";
import { Items } from "../Items";
import { FurnaceRecipes } from "../Items/crafting/FurnaceRecipes";
import { ItemStack } from "../Items/ItemStack";
import { TileEntity } from "./TileEntity";

export class TEFurnace extends TileEntity{
    private furnaceItemStacks: ItemStack[] = Object.seal(Array(3).fill(ItemStack.EMPTY));
    private furnaceBurnTime: number = 0;
    private currentItemBurnTime?: number;
    private cookTime: number = 0;
    private totalCookTime: number = 0;
    private furnaceCustomName?: string;

    private lastTick: number = TileEntity.currentTick;
    private maxStack: number = 64;

    constructor(){
        super();
    }

    public getSizeInventory(): number {
        return this.furnaceItemStacks.length;
    }

    public getInventoryStackLimit(): number {
        return this.maxStack;
    }

    public getCookTime(stack: ItemStack): number {
        return 20;
    }

    public getStackInSlot(index: number): ItemStack {
        return this.furnaceItemStacks[index];
    }

    public decrStackSize(index: number, count: number): ItemStack {
        return ItemStackHelper.getAndSplit(this.furnaceItemStacks, index, count);
    }

    public removeStackFromSlot(index: number): ItemStack {
        return ItemStackHelper.getAndRemove(this.furnaceItemStacks, index);
    }
    /**
     * `[0] - igredient`
     * `[1] - fuel`
     * `[2] - result`
     */
    public setInventorySlotContents(index: number, stack: ItemStack) {
        var itemstack = this.furnaceItemStacks[index];
        var flag = !stack.isEmpty() && stack.isItemEqual(itemstack) && ItemStack.areItemStackMetaEqual(stack, itemstack);
        this.furnaceItemStacks[index] = stack;

        if (stack.getCount() > this.getInventoryStackLimit()) {
            stack.setCount(this.getInventoryStackLimit());
        }

        if (index == 0 && !flag) {
            this.totalCookTime = this.getCookTime(stack);
            this.cookTime = 0;
        }
    }

    public isItemValidForSlot(index: number, stack: ItemStack): boolean {
        if (index == 2) {
            return false;
        } else if (index != 1) {
            return true;
        } else {
            return TEFurnace.isItemFuel(stack);
        }
    }

    public isEmpty(): boolean {
        for (var itemstack of this.furnaceItemStacks) {
            if (!itemstack.isEmpty()) {
                return false;
            }
        }
        return true;
    }

    public isBurning(): boolean {
        return this.furnaceBurnTime > 0;
    }

    public static getItemBurnTime(stack: ItemStack): number {
        if (stack.isEmpty()) {
            return 0;
        } else {
            var item = stack.getItem();

            if (item == Items.COAL) {
                return 160;
            } else if (item == Items.STICK) {
                return 10;
            } else if (item == Items.WOOD) {
                return 30;
            } else {
                return 0;
            }
        }
    }

    public static isItemFuel(stack: ItemStack): boolean {
        return this.getItemBurnTime(stack) > 0;
    }

    public clear() {
        this.furnaceItemStacks.fill(ItemStack.EMPTY);
    }

    public override update(){
        var elapsedTicks = TileEntity.currentTick - this.lastTick;
        this.lastTick = TileEntity.currentTick;

        if (this.isBurning() && this.canSmelt()) {
            this.cookTime += elapsedTicks;
            if (this.cookTime >= this.totalCookTime) {
                this.cookTime = 0;
                this.totalCookTime = this.getCookTime(this.furnaceItemStacks[0]);
                this.smeltItem();
            }
        } else {
            this.cookTime = 0;
        }

        if (this.isBurning()) {
            this.furnaceBurnTime -= elapsedTicks;
        }

        var itemstack = this.furnaceItemStacks[1];

        if (this.isBurning() || !itemstack.isEmpty() && !this.furnaceItemStacks[0].isEmpty()) {
            if (this.furnaceBurnTime <= 0 && this.canSmelt()) {
                this.currentItemBurnTime = TEFurnace.getItemBurnTime(itemstack);
                this.furnaceBurnTime += this.currentItemBurnTime;
                if (this.furnaceBurnTime > 0 && this.isBurning()) {
                    if (!itemstack.isEmpty()) {
                        var item = itemstack.getItem();
                        itemstack.shrink(1);
                        if (itemstack.isEmpty()) {
                            var item1: ItemStack = item.getContainerItem(itemstack);
                            this.furnaceItemStacks[1] = item1;
                        }
                    }
                }
            }

            /* CraftBukkit start - Moved up
            if (this.isBurning() && this.canSmelt())
            {
                ++this.cookTime;

                if (this.cookTime == this.totalCookTime)
                {
                    this.cookTime = 0;
                    this.totalCookTime = this.getCookTime(this.furnaceItemStacks.get(0));
                    this.smeltItem();
                    flag1 = true;
                }
            }
            else
            {
                this.cookTime = 0;
            }
            */
        }
    }

    private canSmelt(): boolean {
        if(this.furnaceItemStacks[0].isEmpty()) {
            return false;
        } else {
            var itemstack = FurnaceRecipes.instance().getSmeltingResult(this.furnaceItemStacks[0]);
            if (itemstack.isEmpty()) {
                return false;
            } else {
                var itemstack1 = this.furnaceItemStacks[2];

                if (itemstack1.isEmpty()) {
                    return true;
                } else if (!itemstack1.isItemEqual(itemstack)) {
                    return false;
                } else if (itemstack1.getCount() + itemstack.getCount() <= this.getInventoryStackLimit() && itemstack1.getCount() + itemstack.getCount() <= itemstack1.getMaxStackSize()) {
                    return true;
                } else {
                    return itemstack1.getCount() + itemstack.getCount() <= itemstack.getMaxStackSize();
                }
            }
        }
    }

    public smeltItem() {
        if (this.canSmelt()) {
            var itemstack = this.furnaceItemStacks[0];
            var itemstack1 = FurnaceRecipes.instance().getSmeltingResult(itemstack);
            var itemstack2 = this.furnaceItemStacks[2];

            if (!itemstack1.isEmpty()) {
                if (itemstack2.isEmpty()) {
                    this.furnaceItemStacks[2] = itemstack1.copy();
                } else if (itemstack2 === itemstack1) {
                    itemstack2.grow(itemstack1.getCount());
                } else {
                    return;
                }
            }

            /*
            if (itemstack2.isEmpty())
            {
                this.furnaceItemStacks.set(2, itemstack1.copy());
            }
            else if (itemstack2.getItem() == itemstack1.getItem())
            {
                itemstack2.grow(itemstack1.getCount());
            }
            */

            itemstack.shrink(1);
        }
    }
}