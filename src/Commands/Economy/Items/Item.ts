import { ItemRegistry } from "./ItemRegistry";
import { ItemStack } from "./ItemStack";

const ireg = new ItemRegistry();

export class Item{
    private name: string;
    private description: string;
    private max_stack_size: number = 64;
    private containerItem?: Item;
    public static REGISTRY: ItemRegistry = ireg;

    constructor(name: string, descr: string, m_s_size?: number){
        this.name = name;
        this.description = descr;
        if(m_s_size){
            this.max_stack_size = m_s_size;
        }
    }

    public getName(): string{
        return this.name;
    }
    public setName(name: string): Item{
        this.name = name;
        return this;
    }

    public getDescription(): string{
        return this.description;
    }
    public setDescription(description: string){
        this.description = description;
        return this;
    }

    public setContainerItem(containerItem: Item): Item {
        this.containerItem = containerItem;
        return this;
    }

    public getContainerItem(): Item | undefined;
    public getContainerItem(itemStack: ItemStack): ItemStack;

    public getContainerItem(itemStack?: ItemStack): ItemStack | (Item | undefined) {
        if(itemStack){
            if (!this.hasContainerItem(itemStack)) {
                return ItemStack.EMPTY;
            }
            return new ItemStack(this.getContainerItem()!);
        }else{
            return this.containerItem;
        }
    }

    public hasContainerItem(stack: ItemStack): boolean {
        return this.containerItem !== undefined;
    }

    public getMaxStackSize(): number{
        return this.max_stack_size;
    }
    public setMaxStackSize(m_s_size: number): Item{
        this.max_stack_size = m_s_size;
        return this;
    }
}