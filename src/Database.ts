import { Sequelize } from "sequelize-typescript";

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
        MusicManager,
        User,
        Item,
        ItemStack,
        ItemStackToItem,
        Recipe,
        Ingredient
    ]
});