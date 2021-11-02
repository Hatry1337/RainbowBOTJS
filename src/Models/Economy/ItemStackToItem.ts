import { Sequelize } from "sequelize";
import { Table, Model, Column, ForeignKey, AllowNull, Default } from "sequelize-typescript";
import { Item } from "./Item";
import { ItemStack } from "./ItemStack";


@Table({
    timestamps: true,
})
export class ItemStackToItem extends Model {
    @ForeignKey(() => ItemStack)
    @Column
    itemStackId!: number

    @ForeignKey(() => Item)
    @Column
    itemCode!: string
}