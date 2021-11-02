import { Ingredient } from "../../Models/Economy/Ingredient";
import { Item } from "../../Models/Economy/Item"
import { ItemStack } from "../../Models/Economy/ItemStack";
import { Recipe } from "../../Models/Economy/Recipe";

export interface StackDef{
    Code: string,
    Count: number
}

export interface RecipeDef{
    Result: StackDef;
    Ingredients: StackDef[];
    Type: string;
}

export class RecipeController{
    List: RecipeDef[] = [
        {
            Result: {
                Code: "iron_ingot",
                Count: 1
            },
            Ingredients: [
                {
                    Code: "iron_ore",
                    Count: 1
                }
            ],
            Type: "machine#furnace"
        },
        {
            Result: {
                Code: "iron_ingot",
                Count: 2
            },
            Ingredients: [
                {
                    Code: "iron_ore_dust",
                    Count: 1
                }
            ],
            Type: "machine#furnace"
        }
    ]
    async CheckDefs(){
        var recipes = await Recipe.findAll({
            include: [
                {
                    model: ItemStack, 
                    as: 'Result', 
                    include: [Item]
                }, 
                {
                    model: ItemStack,
                    as: 'Ingredients', 
                    include: [Item]
                }
            ]
        });

        for(var r of this.List){
            var recipe = recipes.find(rc => {
                if(rc.Type !== r.Type) return false;
                if(rc.Result.Item.Code !== r.Result.Code) return false;
                if(rc.Result.Count !== r.Result.Count) return false;

                for(var ing of r.Ingredients){
                    if(!rc.Ingredients.find(imd => imd.Count === ing.Count && imd.Item.Code === ing.Code)) return false;
                }
                return true;
            });
            if(!recipe){
                var result = (await ItemStack.findOrCreate({
                    where:{
                        itemCode: r.Result.Code,
                        Count: r.Result.Count,
                        ownerId: "system",
                        Container: "virtual"
                    },
                    defaults: {
                        itemCode: r.Result.Code,
                        Count: r.Result.Count,
                        ownerId: "system",
                        Container: "virtual"
                    }
                }))[0];
                recipe = await Recipe.create({
                    resultId: result.id,
                    Type: r.Type
                });

                for(var i of r.Ingredients){
                    var ingredient = (await ItemStack.findOrCreate({
                        where:{
                            itemCode: i.Code,
                            Count: i.Count,
                            ownerId: "system",
                            Container: "virtual"
                        },
                        defaults: {
                            itemCode: i.Code,
                            Count: i.Count,
                            ownerId: "system",
                            Container: "virtual"
                        }
                    }))[0];
                    await Ingredient.create({
                        recipeId: recipe.id,
                        ingredientId: ingredient.id
                    });
                }
            }
        }
    }
}