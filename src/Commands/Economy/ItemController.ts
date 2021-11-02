import { Item } from "../../Models/Economy/Item"

export interface ItemDef{
    Name: string;
    Code: string;
    Description: string;
    IsCraftable: boolean;
    Meta?: any;
}

export class ItemController{
    List: ItemDef[] = [
        {
            Name: "Stone",
            Code: "stone",
            Description: "Stone. What did u expect?",
            IsCraftable: false
        },
        {
            Name: "Dirt",
            Code: "dirt",
            Description: "Dirt. What did u expect?",
            IsCraftable: false
        },
        {
            Name: "Iron Ore",
            Code: "iron_ore",
            Description: "You can turn it into iron ingots!",
            IsCraftable: false
        },
        {
            Name: "Copper Ore",
            Code: "copper_ore",
            Description: "You can turn it into copper ingots!",
            IsCraftable: false
        },
        {
            Name: "Tin Ore",
            Code: "tin_ore",
            Description: "You can turn it into tin ingots!",
            IsCraftable: false
        },
        {
            Name: "Iron Ingot",
            Code: "iron_ingot",
            Description: "One of basic materials.",
            IsCraftable: true
        },
        {
            Name: "Copper Ingot",
            Code: "copper_ingot",
            Description: "One of basic materials.",
            IsCraftable: true
        },
        {
            Name: "Tin Ingot",
            Code: "tin_ingot",
            Description: "One of basic materials.",
            IsCraftable: true
        },
        {
            Name: "Bronze Ingot",
            Code: "bronze_ingot",
            Description: "Alloy of copper and tin.",
            IsCraftable: true
        },
        {
            Name: "Furnace",
            Code: "furnace",
            Description: "Machine that melt items.",
            IsCraftable: true
        },
        {
            Name: "Iron Ore Dust",
            Code: "iron_ore_dust",
            Description: "Crushed iron ore.",
            IsCraftable: true
        },

    ]
    async CheckDefs(){
        var items: Item[] = [];
        for(var i of this.List){
            var item = await Item.findOrCreate({
                where: { 
                    Name: i.Name 
                },
                defaults: {
                    Name: i.Name,
                    Code: i.Code,
                    Description: i.Description,
                    IsCraftable: i.IsCraftable,
                    Meta: i.Meta || {}
                }
            });
            items.push(item[0]);
        }
        return items;
    }

    static async Define(i: ItemDef){
        var item = await Item.findOrCreate({
            where: { 
                Name: i.Name 
            },
            defaults: {
                Name: i.Name,
                Code: i.Code,
                Description: i.Description,
                IsCraftable: i.IsCraftable,
                Meta: i.Meta || {}
            }
        });
        return item[0];
    }
}