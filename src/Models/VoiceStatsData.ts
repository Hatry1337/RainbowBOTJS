import { Table, Model, Column, DataType, HasMany, AutoIncrement, PrimaryKey } from "sequelize-typescript";

@Table({
    timestamps: true,
})
export class VoiceStatsData extends Model {
    @PrimaryKey 
    @AutoIncrement 
    @Column
    id!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    UserID!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    ChannelID!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    ChannelName!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    GuildID!: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0
    })
    VoiceTime!: number;
}