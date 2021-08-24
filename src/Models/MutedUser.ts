import { Table, Model, Column, DataType, AfterFind, AutoIncrement, PrimaryKey } from "sequelize-typescript";

export interface MutedUserMeta{

}

@Table({
    timestamps: true,
})
export class MutedUser extends Model {
    @PrimaryKey 
    @AutoIncrement 
    @Column
    id!: number;
    
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    DsID!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    Tag!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    GuildID!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    MuterID!: string;
    
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    Reason!: string;

    @Column({
        type: DataType.DATE,
        allowNull: false
    })
    MuteDate!: Date;

    @Column({
        type: DataType.DATE,
        allowNull: true
    })
    UnmuteDate?: Date;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    MuteRoleID!: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false
    })
    IsMuted!: boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
    })
    IsPermMuted!: boolean;

    @Column({
        type: DataType.JSON,
        allowNull: false,
        defaultValue: {}
    })
    Meta!: MutedUserMeta;
}