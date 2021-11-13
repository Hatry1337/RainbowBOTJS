import { Item } from "../Items/Item";
import { TileEntity } from "../TileEntitys/TileEntity";


export class TileEntityRegistry{
    private registry: Map<string, typeof TileEntity> = new Map();
    private itemBindings: Map<Item, typeof TileEntity> = new Map();

    public putObject(code: string, tile: typeof TileEntity, item: Item): void{
        this.registry.set(code, tile);
        this.itemBindings.set(item, tile);
    }

    public getObject(code: string): typeof TileEntity | undefined{
        return this.registry.get(code);
    }

    public getCode(tile: typeof TileEntity): string | undefined{
        for(var e of this.registry.entries()){
            if(e[1] === tile){
                return e[0];
            }
        }
    }

    public getSize(): number{
        return this.registry.size;
    }

    public containsCode(code: string): boolean{
        return this.registry.has(code);
    }

    public getObjectByItem(item: Item){
        return this.itemBindings.get(item);
    }

    public getItemByObject(tile: typeof TileEntity){
        for(var e of this.itemBindings.entries()){
            if(e[1] === tile){
                return e[0];
            }
        }
    }
}