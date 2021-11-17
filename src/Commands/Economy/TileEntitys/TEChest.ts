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

export class TEChest extends TileEntity{
    private chestItemStacks: ItemStack[] = Object.seal(Array(20).fill(ItemStack.EMPTY));
    private chestCustomName?: string;
    private chestBlackList: Map<Item, boolean> = new Map();

    private maxStack: number = 64;

    public override proto: typeof TileEntity = TEChest;

    constructor(){
        super();
    }

    public addItemToBlackList(item: Item): void {
        this.chestBlackList.set(item, true);
    }

    public isItemBlackListed(item: Item): boolean {
        return this.chestBlackList.has(item);
    }

    public removeItemFromBlackList(item: Item): void {
        this.chestBlackList.delete(item);
    }

    public getSizeInventory(): number {
        return this.chestItemStacks.length;
    }

    public getInventoryStackLimit(): number {
        return this.maxStack;
    }

    public getStackInSlot(index: number): ItemStack {
        return this.chestItemStacks[index];
    }

    public decrStackSize(index: number, count: number): ItemStack {
        return ItemStackHelper.getAndSplit(this.chestItemStacks, index, count);
    }

    public removeStackFromSlot(index: number): ItemStack {
        return ItemStackHelper.getAndRemove(this.chestItemStacks, index);
    }

    public setInventorySlotContents(index: number, stack: ItemStack) {
        this.chestItemStacks[index] = stack;

        if (stack.getCount() > this.getInventoryStackLimit()) {
            stack.setCount(this.getInventoryStackLimit());
        }
    }

    public isItemValidForSlot(index: number, stack: ItemStack): boolean {
        if(this.isItemBlackListed(stack.getItem())){
            return false;
        }
        return true;
    }

    public isEmpty(): boolean {
        for (var itemstack of this.chestItemStacks) {
            if (!itemstack.isEmpty()) {
                return false;
            }
        }
        return true;
    }

    public clear() {
        this.chestItemStacks.fill(ItemStack.EMPTY);
    }

    public override loadMeta(meta: ITileEntityMeta){
        if(meta.slots && meta.slots instanceof Array && meta.slots.length === this.getSizeInventory()){
            this.chestItemStacks = Object.seal(Array(this.getSizeInventory()).fill(ItemStack.EMPTY));
            for(var i = 0; i < this.getSizeInventory(); i++){
                var item = Item.REGISTRY.getItem(meta.slots[i].item);
                if(item){
                    this.chestItemStacks[i] = new ItemStack(item, meta.slots[i].size, meta.slots[i].meta);
                }
            }
        }
        if(meta.CustomName && typeof meta.CustomName === "string"){
            this.chestCustomName = meta.CustomName;
        }
    }

    public override saveMeta(){
        var slots = [];
        for(var i of this.chestItemStacks){
            slots.push({
                item: Item.REGISTRY.getCode(i.getItem()),
                size: i.getCount(),
                meta: i.getMeta()
            });
        }
        var data = {
            slots,
            CustomName: this.chestCustomName
        }
        return data;
    }

    public override async showInterface(player: Player, message: Discord.Message){
        let slotstxt = "";
        let i = 0;
        for(let s of this.chestItemStacks){
            if(s.isEmpty()){
                slotstxt += `[${i}] \`EMPTY\`\n`;
            }else{
                slotstxt += `[${i}] x${s.getCount()} ${s.getItem().getName()} (\`${Item.REGISTRY.getCode(s.getItem())}\`)\n`;
            }
            i++;
        }
        let emb = new Discord.MessageEmbed({
            title: this.chestCustomName || `Chest`,
            description: slotstxt,
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
                
                let item = player.getInventory().find(i => Item.REGISTRY.getCode(i.getItem()) === args[2] && i.getCount() >= count);
                if(!item){
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
                }else if(inp.isItemEqual(item) && ItemStack.areItemStackMetaEqual(inp, item) && inp.getCount()+count <= inp.getMaxStackSize()){
                    inp.grow(count);
                }else if (inp.getCount()+count > inp.getMaxStackSize()){
                    return await Utils.ErrMsg("This slot is fully filled.", message.channel);
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
                    title: `Chest Interactions`,
                    description:    "`put <slot> <item_code>[ <count>]` - put specified item into chest slot.\n" +
                                    "`get <slot>` - get items from specified slot.",
                    color: Colors.Noraml
                });
                return await message.channel.send(emb);
            }
        }
    }
}