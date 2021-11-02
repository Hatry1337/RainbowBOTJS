import { Table, Model, Column, DataType, AutoIncrement, PrimaryKey, HasOne, ForeignKey, AllowNull, BelongsToMany, BelongsTo } from "sequelize-typescript";
import { Item } from "./Item";
import { User } from "../User";
import { ItemStackToItem } from "./ItemStackToItem";

interface ItemStackMeta{
    ProcessingTimeStamp?: Date;
}

@Table({
    timestamps: true,
})
export class ItemStack extends Model {
    @PrimaryKey 
    @AutoIncrement 
    @Column
    id!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    Count!: number;

    @ForeignKey(() => Item)
    @AllowNull(false) 
    @Column
    itemCode!: string;

    @BelongsTo(() => Item)
    Item!: Item;

    @ForeignKey(() => User)
    @AllowNull(false) 
    @Column
    ownerId!: string;

    @BelongsTo(() => User)
    Owner!: User;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: "inventory"
    })
    Container!: string;

    @Column({
        type: DataType.JSONB,
        allowNull: false,
        defaultValue: {}
    })
    Meta!: ItemStackMeta;
}