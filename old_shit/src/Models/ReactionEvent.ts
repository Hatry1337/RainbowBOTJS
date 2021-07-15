import { Table, Model, Column, DataType, PrimaryKey, IsUUID } from "sequelize-typescript";

@Table({
    timestamps: true,
})
export class ReactionEvent extends Model {
    @IsUUID(4)
    @PrimaryKey
    @Column({
        type: DataType.UUID
    })
    id!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    RoleID!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    EmojiID!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    MessageID!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    ChannelID!: string;

    @Column({
        type: DataType.JSONB,
        allowNull: false,
    })
    GuildID!: any;
}
