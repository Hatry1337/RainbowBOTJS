import { Sequelize } from "sequelize";
import { Table, Model, Column, ForeignKey, AllowNull, Default } from "sequelize-typescript";
import { Item } from "./Item";
import { ItemStack } from "./ItemStack";
import { Recipe } from "./Recipe";


@Table({
    timestamps: true,
})
export class Ingredient extends Model {
    @ForeignKey(() => Recipe)
    @Column
    recipeId!: number

    @ForeignKey(() => ItemStack)
    @Column
    ingredientId!: number
}