import { Table, Model, Column, DataType, AutoIncrement, PrimaryKey, HasMany, BelongsToMany } from "sequelize-typescript";
import { ItemStack } from "./ItemStack";
import { ItemStackToItem } from "./ItemStackToItem";

interface ItemMeta{
}

@Table({
    timestamps: true,
})
export class Item extends Model {
    @PrimaryKey 
    @AutoIncrement 
    @Column
    id!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    Name!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    Code!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: ""
    })
    Description!: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    IsCraftable!: boolean;

    @BelongsToMany(() => ItemStack, () => ItemStackToItem)
    stacks!: Array<ItemStack & {ItemStackToItem: ItemStackToItem}>;

    @Column({
        type: DataType.JSONB,
        allowNull: false,
        defaultValue: {}
    })
    Meta!: ItemMeta;
}