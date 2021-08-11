import { Table, Model, Column, DataType } from "sequelize-typescript";
import { CustomMessageSettings } from "../Utils";

interface GuildMeta{
    jmgr_msg?: CustomMessageSettings
}

@Table({
    timestamps: true,
})
export class Guild extends Model {
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
    Name!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    OwnerID!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    Region!: string;

    @Column({
        type: DataType.ARRAY(DataType.STRING),
        allowNull: false,
        defaultValue: []
    })
    JoinRolesIDs!: string[];
    
    @Column({
        type: DataType.STRING,
    })
    ModeratorRoleID!: string;

    @Column({
        type: DataType.STRING,
    })
    MutedRoleID!: string;

    @Column({
        type: DataType.STRING,
    })
    JoinMessageChannelID!: string;

    @Column({
        type: DataType.STRING,
    })
    LogChannelID!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    SystemChannelID!: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    IsJoinMessageEnabled!: boolean;

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
    Meta!: GuildMeta;
}