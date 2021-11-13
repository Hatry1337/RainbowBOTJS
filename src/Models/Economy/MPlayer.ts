import { Table, Model, Column, DataType, AutoIncrement, PrimaryKey, ForeignKey, AllowNull, BelongsTo, BeforeInit, BeforeFind, AfterFind, AfterCreate, AfterBulkCreate, AfterRestore, HasMany, BelongsToMany } from "sequelize-typescript";
import { Item } from "../../Commands/Economy/Items/Item";
import { IISObject, ItemStack } from "../../Commands/Economy/Items/ItemStack";
import { User } from "../User";
import { MPlayerRoom } from "./MPlayerRoom";
import { MRoom } from "./MRoom";

@Table({
    timestamps: true,
})
export class MPlayer extends Model {
    @ForeignKey(() => User)
    @PrimaryKey 
    @Column
    userID!: string;

    @BelongsTo(() => User)
    User!: User;

    @BelongsToMany(() => MRoom, () => MPlayerRoom)
    Rooms!: Array<MRoom & {MPlayerRoom: MPlayerRoom}>;

    @Column({
        type: DataType.ARRAY(DataType.JSONB),
        allowNull: false,
        defaultValue: []
    })
    private inventory!: IISObject[];

    public getInventory(){
        var inv: ItemStack[] = [];
        for(var i of this.inventory){
            var item = ItemStack.fromObject(i);
            if(item){
                inv.push(item);
            }
        }
        return inv;
    }

    public setInventory(items: ItemStack[]){
        var inv: IISObject[] = [];
        for(var i of items){
            inv.push(i.toObject());
        }
        this.inventory = inv;
    }
}