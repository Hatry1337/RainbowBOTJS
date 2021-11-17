import { Table, Model, Column, DataType, AutoIncrement, PrimaryKey, ForeignKey, AllowNull, BelongsTo, BeforeInit, BeforeFind, AfterFind, AfterCreate, AfterBulkCreate, AfterRestore, BelongsToMany } from "sequelize-typescript";
import { Item } from "../../Commands/Economy/Items/Item";
import { MiningOre } from "../../Commands/Economy/Registrys/OreRegistry";

interface MMCOres{
    item: string;
    genchance: number;
    drpchance: number;
    min: number;
    max: number;
}

@Table({
    timestamps: true,
})
export class MMiningChannel extends Model {
    @PrimaryKey
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })    
    guildID!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    voiceChanlID!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    textChanlID!: string;
    
    @Column({
        type: DataType.ARRAY(DataType.JSONB),
        allowNull: false,
        defaultValue: []
    })
    private Ores!: MMCOres[];

    public getOres(){
        var ores: MiningOre[] = [];
        for(var i of this.Ores){
            var item = Item.REGISTRY.getItem(i.item);
            if(item){
                ores.push({
                    Ore: item,
                    GenChance: i.genchance,
                    DropChance: i.drpchance,
                    Min: i.min,
                    Max: i.max
                });
            }
        }
        return ores;
    }

    public setOres(ores: MiningOre[]){
        var baseores: MMCOres[] = [];
        for(var o of ores){
            var code = Item.REGISTRY.getCode(o.Ore);
            if(code){
                baseores.push({
                    item: code,
                    genchance: o.GenChance,
                    drpchance: o.DropChance,
                    min: o.Min,
                    max: o.Max
                });
            }
        }
        this.Ores = baseores;
    }
}