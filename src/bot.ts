//import 'dotenv/config';
import { Module, ModuleUUIDPair, Synergy } from "synergy3";
import Discord from "discord.js";
import fs from "fs";
import crypto from "crypto";

import { CoreModules } from "synergy3";
import EiBall from './Modules/8Ball/8Ball';
import Anek from './Modules/Anek/Anek';
import Mute from './Modules/Mute/Mute';
import OBJRender from './Modules/OBJRender/OBJRender';
import OsuInfo from './Modules/OsuInfo/OsuInfo';
import TicTacToe from './Modules/TicTacToe/TicTacToe';
import Clear from './Modules/Clear/Clear';
import BotFetch from './Modules/BotFetch/BotFetch';
import Servers from './Modules/Servers/Servers';
import VoiceStats from './Modules/VoiceStats/VoiceStats';
import MathTools from './Modules/MathTools/MathTools';
import Demotivator from './Modules/Demotivator/Demotivator';
import Quote from './Modules/Quote/Quote';
import RoleManager from './Modules/RoleManager/RoleManager';
import UkrMova from './Modules/UkrMova/UkrMova';
import Roll from './Modules/Roll/Roll';
import RandCat from './Modules/RandCat/RandCat';
import Economy from './Modules/Economy/Economy';
import UTS from './Modules/UnifiedTestSuite/UTS';
import ASCII from './Modules/ASCII/ASCII';
import CowSay from './Modules/CowSay/CowSay';
import GrpMgr from './Modules/GrpMgr/GrpMgr';
import VoteMgr from './Modules/VoteMgr/VoteMgr';

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TOKEN: string;
            DBURI: string;
            MASTER_GUILD: string;
            NODE_ENV: 'development' | 'production';
            TOPGG_TOKEN: string;
            OSU_API_KEY: string;
        }
    }
}

const modules: typeof Module[] = [
    CoreModules.Avatar,
    CoreModules.Config,
    CoreModules.Profile,
    CoreModules.RHelp,
    EiBall,
    Anek,
    Clear,
    Mute,
    OBJRender,
    OsuInfo,
    BotFetch,
    Servers,
    TicTacToe,
    VoiceStats,
    MathTools,
    Demotivator,
    Quote,
    RoleManager,
    UkrMova,
    Roll,
    RandCat,
    Economy,
    UTS,
    ASCII,
    CowSay,
    GrpMgr,
    VoteMgr,
]

let uuids: { [key: string]: string };

/* Load UUIDs from uuids.json, or generate new UUIDs if file doesn't exist. */
if(fs.existsSync("./uuids.json")){
    uuids = JSON.parse(fs.readFileSync("./uuids.json").toString("utf-8"));
}else{
    uuids = {};
    for(let m of modules){
        uuids[m.name] = crypto.randomUUID();
    }
    fs.writeFileSync("./uuids.json", JSON.stringify(uuids, undefined, 4));
}

const modulePairs: ModuleUUIDPair[] = modules.map(m => ({ Module: m, UUID: uuids[m.name] }));

const bot = new Synergy({
    sequelizeURI: process.env.DBURI,
    sequelizeForceSync: false,
    masterGuildId: process.env.MASTER_GUILD,
    moduleGlobalLoading: process.env.NODE_ENV === "production",
    dataSyncDelay: 60,
    userDefaultEconomy: {
        points: 500,
        lvl: 1,
        xp: 0
    },
    saveSQLToFile: false,
    clientOptions: {
        intents: [
            Discord.GatewayIntentBits.DirectMessages,
            Discord.GatewayIntentBits.Guilds,
            Discord.GatewayIntentBits.GuildMessages,
            Discord.GatewayIntentBits.GuildMembers,
            Discord.GatewayIntentBits.GuildVoiceStates
        ],
        presence: {
            status: "online",
            activities: [
                {
                    type: Discord.ActivityType.Listening,
                    name: "Slash Commands🐊",
                }
            ]
        }
    }
}, modulePairs);

(async () => {
    await bot.login(process.env.TOKEN);
})();