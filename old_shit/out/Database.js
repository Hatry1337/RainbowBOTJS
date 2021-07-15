"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Guild_1 = require("./Models/Guild");
const ReactionEvent_1 = require("./Models/ReactionEvent");
exports.sequelize = new sequelize_typescript_1.Sequelize({
    dialect: "postgres",
    username: "rbot_pln",
    password: "4Rp-k65-Yae-3UY",
    database: "rbot_pln",
    host: "127.0.0.1",
    port: 5432,
    models: [
        Guild_1.Guild,
        ReactionEvent_1.ReactionEvent
    ]
});
//# sourceMappingURL=Database.js.map