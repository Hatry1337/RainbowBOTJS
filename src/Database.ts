import { Sequelize } from "sequelize-typescript";

import { Guild } from './Models/Guild';
import { MusicManager } from "./Models/MusicManager";
import { MutedUser } from "./Models/MutedUser";
import { ReactionEvent } from './Models/ReactionEvent';
import { VoiceLobby } from "./Models/VoiceLobby";


export const sequelize = new Sequelize({ 
    dialect: "postgres",
    username: "rbot_pln",
    password: "4Rp-k65-Yae-3UY",
    database: "rbot_pln",
    host: "127.0.0.1",
    port: 5432,
    models: [
        Guild,
        ReactionEvent,
        MutedUser,
        VoiceLobby,
        MusicManager
    ]
});