import { Sequelize } from "sequelize-typescript";
import { Utils } from "./Utils";
import log4js from "log4js";

import { Guild } from './Models/Guild';
import { Item } from "./Models/Economy/Item";
import { ItemStack } from "./Models/Economy/ItemStack";
import { Recipe } from "./Models/Economy/Recipe";
import { MusicManager } from "./Models/MusicManager";
import { MutedUser } from "./Models/MutedUser";
import { ReactionEvent } from './Models/ReactionEvent';
import { User } from "./Models/User";
import { VoiceLobby } from "./Models/VoiceLobby";
import { ItemStackToItem } from "./Models/Economy/ItemStackToItem";
import { Ingredient } from "./Models/Economy/Ingredient";

const logger = log4js.getLogger("database");

export const sequelize = new Sequelize(process.env.DBURI as string, {
    models: [
        Guild,
        ReactionEvent,
        MutedUser,
        VoiceLobby,
        MusicManager,
        User,
        Item,
        ItemStack,
        ItemStackToItem,
        Recipe,
        Ingredient
    ],
    logging: (sql) => {
        logger.info(sql);
    }
});