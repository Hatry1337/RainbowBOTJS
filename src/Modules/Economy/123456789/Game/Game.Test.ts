import { inspect } from "util";
import { RegistryBase } from "./Registry/RegistryBase";
//import { AsicSG100EMiner, AsicSG500EMiner, AsicSG500Miner, BasicAsicMiner } from "../Structures/ItemDef";

import { ItemStack } from "../Structures/ItemStack";
import { ItemPlaceable } from "../Structures/Items/ItemPlaceable";

let smol_inventory = new RegistryBase<ItemStack>("Inventory", ItemStack.prototype);

let itm = new ItemPlaceable(5, "test", "123", 2);

smol_inventory.addEntry(new ItemStack(2, itm));
smol_inventory.addEntry(new ItemStack(7, itm));
smol_inventory.addEntry(new ItemStack(1, itm));
smol_inventory.addEntry(new ItemStack(5, itm));


console.log(inspect(smol_inventory, false, 50));

console.log(inspect(smol_inventory.serialize(), false, 50));

let inv2 = new RegistryBase<ItemStack>("Inventory2", ItemStack.prototype);

console.log(inspect(inv2.deserialize(smol_inventory.serialize()), false, 50));
