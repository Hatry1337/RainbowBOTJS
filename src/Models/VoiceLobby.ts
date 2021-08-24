import { Table, Model, Column, DataType, AfterFind, AutoIncrement, PrimaryKey } from "sequelize-typescript";

export interface VoiceLobbyMeta{

}

@Table({
    timestamps: true,
})
export class VoiceLobby extends Model {
    @PrimaryKey 
    @AutoIncrement 
    @Column
    id!: number;
    
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    OwnerID!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    OwnerTag!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    GuildID!: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
    })
    IsPrivate!: boolean;

    @Column({
        type: DataType.JSON,
        allowNull: false
    })
    InvitedUsersIDs!: string[];

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    CategoryID!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    TextChannelID!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    VoiceChannelID!: string;

    @Column({
        type: DataType.JSON,
        allowNull: false,
        defaultValue: {}
    })
    Meta!: VoiceLobbyMeta;
}