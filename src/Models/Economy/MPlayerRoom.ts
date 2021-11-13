import { Table, Model, Column, DataType, AutoIncrement, PrimaryKey, ForeignKey, AllowNull, BelongsTo, BeforeInit, BeforeFind, AfterFind, AfterCreate, AfterBulkCreate, AfterRestore, HasMany } from "sequelize-typescript";
import { MPlayer } from "./MPlayer";
import { MRoom } from "./MRoom";

@Table({
    timestamps: true,
})
export class MPlayerRoom extends Model {
    @ForeignKey(() => MPlayer)
    @Column
    memberID!: string

    @ForeignKey(() => MRoom)
    @Column
    roomName!: string;
}