import { Table, Model, Column, DataType, HasMany } from "sequelize-typescript";
import { Item } from "./Economy/Item";
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

    private Inventory?: ItemStack[];

    async getInventory(){
        if(this.Inventory){
            return this.Inventory;
        }else{
            return await this.fetchInventory();
        }
    }

    async fetchInventory(){
        this.Inventory = await ItemStack.findAll({
            where: {
                Container: `inventory#${this.ID}`
            },
            include: [Item]
        });
        return this.Inventory;
    }
}