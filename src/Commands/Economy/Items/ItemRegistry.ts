import { Item } from "./Item";


export class ItemRegistry{
    private registry: Map<string, Item> = new Map();

    public registerItem(code: string, item: Item): void{
        this.registry.set(code, item);
    }

    public getItem(code: string): Item | undefined{
        return this.registry.get(code);
    }

    public containsCode(code: string): boolean{
        return this.registry.has(code);
    }
}