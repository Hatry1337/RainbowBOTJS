import { Item } from "../Items/Item";
import { Items } from "../Items/Items";

export interface MiningOre{
    Ore: Item,
    GenChance: number;
    DropChance: number;
    Min: number;
    Max: number;
}

export class OreRegistry{
    private registry: Map<Item, MiningOre> = new Map();

    public static REGISTRY = new OreRegistry();

    public registerOre(ore: MiningOre): void{
        this.registry.set(ore.Ore, ore);
    }

    public getOre(item: Item): MiningOre | undefined{
        return this.registry.get(item);
    }

    public getOres(): MiningOre[] {
        var ores = [];
        for(var o of this.registry.entries()){
            ores.push(o[1]);
        }
        return ores;
    }

    public containsItem(item: Item): boolean{
        return this.registry.has(item);
    }

    static {
        OreRegistry.REGISTRY.registerOre({
            Ore: Items.IRON_ORE,
            GenChance: 0.3,
            DropChance: 0.2,
            Min: 1,
            Max: 4
        });
        OreRegistry.REGISTRY.registerOre({
            Ore: Items.COPPER_ORE,
            GenChance: 0.35,
            DropChance: 0.25,
            Min: 1,
            Max: 5
        });
        OreRegistry.REGISTRY.registerOre({
            Ore: Items.TIN_ORE,
            GenChance: 0.35,
            DropChance: 0.25,
            Min: 1,
            Max: 5
        });
        OreRegistry.REGISTRY.registerOre({
            Ore: Items.GOLD_ORE,
            GenChance: 0.15,
            DropChance: 0.05,
            Min: 1,
            Max: 2
        });
        OreRegistry.REGISTRY.registerOre({
            Ore: Items.COAL,
            GenChance: 0.4,
            DropChance: 0.3,
            Min: 1,
            Max: 5
        });
        OreRegistry.REGISTRY.registerOre({
            Ore: Items.STONE,
            GenChance: 1,
            DropChance: 0.8,
            Min: 1,
            Max: 50
        });
        OreRegistry.REGISTRY.registerOre({
            Ore: Items.DIRT,
            GenChance: 0.7,
            DropChance: 0.6,
            Min: 1,
            Max: 9
        });
    }
}