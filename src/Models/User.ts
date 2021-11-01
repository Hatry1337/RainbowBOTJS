import { Table, Model, Column, DataType, HasMany } from "sequelize-typescript";
import { ItemStack } from "./Economy/ItemStack";

interface UserMeta{
}

@Table({
    timestamps: true,
})
export class User extends Model {
    @Column({
        type: DataType.STRING,
        allowNull: false,
        primaryKey: true
    })
    ID!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    Tag!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    Avatar!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: "Player"
    })
    Group!: string;

    @Column({
        type: DataType.REAL,
        allowNull: false,
        defaultValue: 0.0005
    })
    Points!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: "en"
    })
    Lang!: string;

    @HasMany(() => ItemStack)
    Inventory!: ItemStack[];

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    IsBanned!: boolean;

    @Column({
        type: DataType.JSONB,
        allowNull: false,
        defaultValue: {}
    })
    Meta!: UserMeta;
}