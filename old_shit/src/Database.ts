import { Sequelize } from "sequelize-typescript";

import { Guild } from './Models/Guild';
import { ReactionEvent } from './Models/ReactionEvent';


export const sequelize = new Sequelize({ 
    dialect: "postgres",
    username: "rbot",
    password: "t6V-b7y-a26-64j",
    database: "rbot",
    host: "127.0.0.1",
    port: 5432,
    models: [
        Guild,
        ReactionEvent
    ]
});