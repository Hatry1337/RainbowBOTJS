import { Sequelize } from "sequelize-typescript";
import { Utils } from "./Utils";
import log4js from "log4js";

import { Guild } from './Models/Guild';
import { MPlayer } from "./Models/Economy/MPlayer";
import { MusicManager } from "./Models/MusicManager";
import { MutedUser } from "./Models/MutedUser";
import { ReactionEvent } from './Models/ReactionEvent';
import { User } from "./Models/User";
import { VoiceLobby } from "./Models/VoiceLobby";
import { MRoom } from "./Models/Economy/MRoom";
import { MPlayerRoom } from "./Models/Economy/MPlayerRoom";
import { MMiningChannel } from "./Models/Economy/MMiningChannel";

const logger = log4js.getLogger("database");

export const sequelize = new Sequelize(process.env.DBURI as string, {
    models: [
        Guild,
        ReactionEvent,
        MutedUser,
        VoiceLobby,
        MusicManager,
        User,
        MPlayer,
        MRoom,
        MPlayerRoom,
        MMiningChannel
    ],
    logging: (sql) => {
        logger.info(sql);
    }
});