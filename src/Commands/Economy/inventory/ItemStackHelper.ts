import { ItemStack } from "../Items/ItemStack"

export class ItemStackHelper{
    public static getAndSplit(stacks: ItemStack[], index: number, amount: number): ItemStack {
        return index >= 0 && index < stacks.length && !stacks[index].isEmpty() && amount > 0 ? stacks[index].splitStack(amount) : ItemStack.EMPTY;
    }

    public static getAndRemove(stacks: ItemStack[], index: number): ItemStack {
        return index >= 0 && index < stacks.length ? stacks[index] = ItemStack.EMPTY : ItemStack.EMPTY;
    }
/*
    public static NBTTagCompound saveAllItems(NBTTagCompound tag, NonNullList<ItemStack> list) {
        return saveAllItems(tag, list, true);
    }

    public static saveAllItems(tag: string, list: ItemStack[], saveEmpty: boolean) {
        NBTTagList nbttaglist = new NBTTagList();

        for (var i = 0; i < list.length; i++) {
            var itemstack = list[i];

            if (!itemstack.isEmpty()) {
                NBTTagCompound nbttagcompound = new NBTTagCompound();
                nbttagcompound.setByte("Slot", (byte) i);
                itemstack.writeToNBT(nbttagcompound);
                nbttaglist.appendTag(nbttagcompound);
            }
        }

        if (!nbttaglist.hasNoTags() || saveEmpty) {
            tag.setTag("Items", nbttaglist);
        }

        return tag;
    }

    public static void loadAllItems(NBTTagCompound tag, NonNullList<ItemStack> list) {
        NBTTagList nbttaglist = tag.getTagList("Items", 10);

        for (int i = 0; i < nbttaglist.tagCount(); ++i) {
            NBTTagCompound nbttagcompound = nbttaglist.getCompoundTagAt(i);
            int j = nbttagcompound.getByte("Slot") & 255;

            if (j >= 0 && j < list.size()) {
                list.set(j, new ItemStack(nbttagcompound));
            }
        }
    }
*/
}