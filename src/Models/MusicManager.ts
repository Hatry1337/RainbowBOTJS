import { Table, Model, Column, DataType, AfterFind, AutoIncrement, PrimaryKey, AllowNull } from "sequelize-typescript";
import { TrackOptions } from "../Commands/Music/TrackOptions";

export interface MusicManagerMeta{

}

@Table({
    timestamps: true,
})
export class MusicManager extends Model {
    @PrimaryKey 
    @AutoIncrement 
    @Column
    id!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
	guild_id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
	music_message_id!: string;
	
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    music_channel_id!: string;
	
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    queue_message_id!: string;
	
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    dj_role_id!: string;
	
    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    playing_channel_id?: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    is_playing!: boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
	is_repeated!: boolean;
	
    @Column({
        type: DataType.JSONB,
        allowNull: true,
    })
	current_track?: TrackOptions;

    @Column({
        type: DataType.ARRAY(DataType.JSONB),
        allowNull: false,
        defaultValue: []
    })
	queue!: TrackOptions[];

    @Column({
        type: DataType.JSONB,
        allowNull: false,
        defaultValue: {}
    })
	meta!: MusicManagerMeta;

}