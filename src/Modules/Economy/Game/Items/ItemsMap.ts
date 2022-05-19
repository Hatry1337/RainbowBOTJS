import Item from "./Item";
import ItemRoom from "./ItemRoom";

export const ItemsMap: Map<number, Item> = new Map([
    [0, new Item(0, "test item", "test")],
    [1, new ItemRoom(new Item(1, "test room", "room"), 10000, 20, 100)],
])