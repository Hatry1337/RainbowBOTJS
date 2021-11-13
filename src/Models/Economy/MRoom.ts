import { Table, Model, Column, DataType, AutoIncrement, PrimaryKey, ForeignKey, AllowNull, BelongsTo, BeforeInit, BeforeFind, AfterFind, AfterCreate, AfterBulkCreate, AfterRestore, BelongsToMany } from "sequelize-typescript";
import { ITEObject, TileEntity } from "../../Commands/Economy/TileEntitys/TileEntity";
import { MPlayer } from "./MPlayer";
import { MPlayerRoom } from "./MPlayerRoom";

@Table({
    timestamps: true,
})
export class MRoom extends Model {
    @PrimaryKey
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name!: string;
    
    @ForeignKey(() => MPlayer)
    @Column
    ownerID!: string;

    @BelongsTo(() => MPlayer)
    Owner!: MPlayer;

    @BelongsToMany(() => MPlayer, () => MPlayerRoom)
    Members!: MPlayer[];

    @Column({
        type: DataType.ARRAY(DataType.JSONB),
        allowNull: false,
        defaultValue: []
    })
    private mechanisms!: ITEObject[];

    public getMechs(){
        var mechs: TileEntity[] = [];
        for(var i of this.mechanisms){
            var te = TileEntity.REGISTRY.getObject(i.code);
            if(te){
                var mech = new te();
                mech.loadMeta(i.meta);
                mechs.push(mech);
            }
        }
        return mechs;
    }

    public setMechs(tiles: TileEntity[]){
        var mechs: ITEObject[] = [];
        for(var t of tiles){
            var code = TileEntity.REGISTRY.getCode(t.proto);
            if(code){
                mechs.push({
                    code,
                    meta: t.saveMeta()
                });
            }
        }
        this.mechanisms = mechs;
    }
}