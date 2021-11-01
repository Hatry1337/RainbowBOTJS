import { Table, Model, Column, DataType, AutoIncrement, PrimaryKey, HasMany, HasOne, ForeignKey, AllowNull, BelongsToMany, BelongsTo } from "sequelize-typescript";
import { Ingredient } from "./Ingredient";
import { ItemStack } from "./ItemStack";

interface RecipeMeta{
}

@Table({
    timestamps: true,
})
export class Recipe extends Model {
    @PrimaryKey 
    @AutoIncrement 
    @Column
    id!: number;
 
    @Column
    Type!: string;

    @BelongsToMany(() => ItemStack, () => Ingredient)
    Ingredients!: Array<ItemStack & {Ingredient: Ingredient}>;

    @ForeignKey(() => ItemStack)
    @AllowNull(false) 
    @Column
    resultId!: number;

    @BelongsTo(() => ItemStack)
    Result!: ItemStack;

    @Column({
        type: DataType.JSONB,
        allowNull: false,
        defaultValue: {}
    })
    Meta!: RecipeMeta;
}