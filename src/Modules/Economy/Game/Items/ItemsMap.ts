import Item from "./Item";
import ItemPlaceable from "./ItemPlaceable";
import { ItemPoints } from "./ItemPoints";
import ItemRoom from "./ItemRoom";
import ItemUsable from "./ItemUsable";

function idmap(item: Item): [number, Item]{
    return [item.id, item];
}

export const ItemsMap: Map<number, Item> = new Map([
    idmap(new Item(0, "test item", "test")),
    //idmap(new Item(1, "soil", "consume soil")),
    idmap(new Item(2, "arch linux", "Arch Linux distribution")),
    idmap(new ItemRoom(new Item(3, "test room", "room"), 10000, 20, 100)),
    idmap(new ItemPlaceable(new Item(4, "Laptop", "Laptop. Run arch linux."), 1)),
    idmap(new ItemPoints(new Item(1, "200 Points", "200 points on balance."), 200)),
]);