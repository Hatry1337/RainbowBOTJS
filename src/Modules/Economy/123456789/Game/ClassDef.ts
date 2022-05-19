//import { Miner } from "../Structures/Items/Miner";
import { ItemPlaceable } from "../Structures/Items/ItemPlaceable";
import { ItemStack } from "../Structures/ItemStack";
import { Item } from "../Structures/Items/Item";
import { RegistryEntry } from "./Registry/RegistryEntry";
import { RegistryBase } from "./Registry/RegistryBase"
//import { Room } from "../Structures/Room";

export const ClassDef: (new (...args: any[]) => any)[] = [RegistryBase, RegistryEntry, Item, ItemPlaceable, /*Miner*,*/ ItemStack, ]//Room]