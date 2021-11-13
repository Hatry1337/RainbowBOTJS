import { ItemStackHelper } from "../inventory/ItemStackHelper";
import { Items } from "../Items/Items";
import { FurnaceRecipes } from "../Items/crafting/FurnaceRecipes";
import { ItemStack } from "../Items/ItemStack";
import { ITileEntityMeta, TileEntity } from "./TileEntity";
import { World } from "../World/World";
import { Item } from "../Items/Item";
import Discord from "discord.js";
import log4js from "log4js";
import { Player } from "../inventory/Player";
import { Colors, Utils } from "../../../Utils";

const logger = log4js.getLogger("economy");

export class TEFurnace extends TileEntity{
    private furnaceItemStacks: ItemStack[] = Object.seal(Array(3).fill(ItemStack.EMPTY));
    private furnaceBurnTime: number = 0;
    private currentItemBurnTime?: number;
    private cookTime: number = 0;
    private totalCookTime: number = 0;
    private furnaceCustomName?: string;

    private lastTick: number = World.currentTick;
    private maxStack: number = 64;

    public override proto: typeof TileEntity = TEFurnace;

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

        if (index === 0 && !flag) {
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
        var elapsedTicks = World.currentTick - this.lastTick;
        this.lastTick = World.currentTick;

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
                } else if (itemstack2.isItemEqual(itemstack1) && ItemStack.areItemStackMetaEqual(itemstack1, itemstack2)) {
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

    public override loadMeta(meta: ITileEntityMeta){
        if(meta.slots && meta.slots instanceof Array && meta.slots.length === this.getSizeInventory()){
            this.furnaceItemStacks = Object.seal(Array(this.getSizeInventory()).fill(ItemStack.EMPTY));
            for(var i = 0; i < this.getSizeInventory(); i++){
                var item = Item.REGISTRY.getItem(meta.slots[i].item);
                if(item){
                    this.furnaceItemStacks[i] = new ItemStack(item, meta.slots[i].size, meta.slots[i].meta);
                }
            }
        }
        if(meta.BurnTime && typeof meta.BurnTime === "number"){
            this.furnaceBurnTime = meta.BurnTime;
        }
        if(meta.CookTime && typeof meta.CookTime === "number"){
            this.cookTime = meta.CookTime;
        }
        if(meta.CookTimeTotal && typeof meta.CookTimeTotal === "number"){
            this.totalCookTime = meta.CookTimeTotal;
        }
        this.currentItemBurnTime = TEFurnace.getItemBurnTime(this.furnaceItemStacks[1]);
    }

    public override saveMeta(){
        var slots = [];
        for(var i of this.furnaceItemStacks){
            slots.push({
                item: Item.REGISTRY.getCode(i.getItem()),
                size: i.getCount(),
                meta: i.getMeta()
            });
        }
        var data = {
            slots,
            BurnTime: this.furnaceBurnTime,
            CookTime: this.cookTime,
            CookTimeTotal: this.totalCookTime,
        }
        return data;
    }

    public override async showInterface(player: Player, message: Discord.Message){
        let inpt = this.getStackInSlot(0);
        let fuel = this.getStackInSlot(1);
        let outp = this.getStackInSlot(2);

        let emb = new Discord.MessageEmbed({
            title: `Furnace`,
            fields: [
                { name: "[0] Input Slot", value: inpt.isEmpty() ? "`EMPTY`" : `**[x${inpt.getCount()}]** ${inpt.getItem().getName()} \`${Item.REGISTRY.getCode(inpt.getItem())}\``},
                { name: "[1] Fuel Slot", value: fuel.isEmpty() ? "`EMPTY`" : `**[x${fuel.getCount()}]** ${fuel.getItem().getName()} \`${Item.REGISTRY.getCode(fuel.getItem())}\``},
                { name: "[2] Output Slot", value: outp.isEmpty() ? "`EMPTY`" : `**[x${outp.getCount()}]** ${outp.getItem().getName()} \`${Item.REGISTRY.getCode(outp.getItem())}\``},
                { name: "Status", value: (this.isBurning() ? "[🔥] " : "[◯] ") + `Burn Time: ${Math.floor(this.furnaceBurnTime / 2)} sec.\n Progress: ${Math.floor(this.cookTime / (this.totalCookTime || 1) * 100)}%`}

            ],
            color: Colors.Noraml
        });
        return await message.channel.send(emb);
    }

    public override async interact(player: Player, message: Discord.Message){
        let args = message.content.split(" ").slice(2);

        switch(args[0]){
            case "put": {
                if(!args[1]){
                    return await Utils.ErrMsg("No slot index specified.", message.channel);
                }
                
                if(!args[2]){
                    return await Utils.ErrMsg("No item to put specified.", message.channel);
                }

                let index = parseInt(args[1]);
                let count = parseInt(args[3]);

                if(isNaN(index) || index < 0){
                    return await Utils.ErrMsg("Incorrect slot index specified.", message.channel);
                }

                if(isNaN(count) || count <= 0) count = 1;
                
                let item = player.getInventory().find(i => Item.REGISTRY.getCode(i.getItem()) === args[2]);
                if(!item || item.getCount() < count){
                    return await Utils.ErrMsg("No or not enough items in your inventory.", message.channel);
                }

                if(!this.isItemValidForSlot(index, item)){
                    return await Utils.ErrMsg("You can't put this item into this slot.", message.channel);
                }

                let inp = this.getStackInSlot(index);

                if(item.getCount() === count){
                    player.delItem(item);
                }else{
                    item.shrink(count);
                }
                if(inp.isEmpty()){
                    var cp = item.copy();
                    cp.setCount(count);
                    this.setInventorySlotContents(index, cp);
                }else if(inp.isItemEqual(item) && ItemStack.areItemStackMetaEqual(inp, item)){
                    inp.grow(count);
                }else{
                    return await Utils.ErrMsg("This slot is filled with other type of item.", message.channel);
                }

                return await this.showInterface(player, message);
            }

            case "get": {
                if(!args[1]){
                    return await Utils.ErrMsg("No slot index specified.", message.channel);
                }

                let index = parseInt(args[1]);

                if(isNaN(index) || index < 0){
                    return await Utils.ErrMsg("Incorrect slot index specified.", message.channel);
                }

                let slot = this.getStackInSlot(index);

                player.addItem(slot);
                this.setInventorySlotContents(index, ItemStack.EMPTY);

                return await this.showInterface(player, message);
            }

            default:{
                let emb = new Discord.MessageEmbed({
                    title: `Furnace Interactions`,
                    description:"`put <slot> <item_code>[ <count>]` - put specified item into mechanism slot.",
                    color: Colors.Noraml
                });
                return await message.channel.send(emb);
            }
        }
    }
}