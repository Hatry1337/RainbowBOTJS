import { Item } from "../Items/Item";


export class ItemRegistry{
    private registry: Map<string, Item> = new Map();

    public registerItem(code: string, item: Item): void{
        this.registry.set(code, item);
    }

    public getItem(code: string): Item | undefined{
        return this.registry.get(code);
    }

    public getCode(item: Item): string | undefined{
        for(var e of this.registry.entries()){
            if(e[1] === item){
                return e[0];
            }
        }
    }

    public containsCode(code: string): boolean{
        return this.registry.has(code);
    }
}