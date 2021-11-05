import { Table, Model, Column, DataType, AutoIncrement, PrimaryKey, ForeignKey, AllowNull, BelongsTo, BeforeInit, BeforeFind, AfterFind, AfterCreate, AfterBulkCreate, AfterRestore } from "sequelize-typescript";
import { Item } from "./Item";

interface ItemStackMeta{
    ProcessingTimeStamp?: number;
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

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    Container!: string;

    @Column({
        type: DataType.JSONB,
        allowNull: false,
        defaultValue: {}
    })
    Meta!: ItemStackMeta;

    isStackable(tocmp: ItemStack){
        if(this.id === tocmp.id) return false;
        if(this.Container !== tocmp.Container) return false;
        if(this.itemCode !== tocmp.itemCode) return false;
        if(JSON.stringify(this.Meta) !== JSON.stringify(tocmp.Meta)) return false;
        
        return true;
    }

    async stackWith(tostack: ItemStack[]){
        for(var s of tostack){
            if(this.isStackable(s)){
                this.Count += s.Count;
                await s.destroy();
            }
        }
        await this.save();
    }
}