import 'dotenv/config';
import { GlobalLogger, Module, ModuleUUIDPair, Synergy } from "synergy3";
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
import ClassChecker from "./Modules/ClassesChecker/ClassChecker";
import Admin from "./Modules/Admin/Admin";
import Shakalize from "./Modules/Shakalize/Shakalize";
import MkMeme from "./Modules/MkMeme/MkMeme";
import ContextCategory from "./Modules/ContextCategory/ContextCategory";
import { GlobalFonts } from "@napi-rs/canvas";
import path from "path";
import Prometheus from './Prometheus';

GlobalFonts.registerFromPath(path.join(__dirname, "..", "..", "..", "assets", "fonts", "NotoColorEmoji-Regular.ttf"), "Noto Color Emoji");
GlobalFonts.registerFromPath(path.join(__dirname, "..", "..", "..", "assets", "fonts", "arimobold.ttf"), "Arimo");
GlobalFonts.registerFromPath(path.join(__dirname, "..", "..", "..", "assets", "fonts", "Comfortaa-Regular.ttf"), "Comfortaa");
GlobalFonts.registerFromPath(path.join(__dirname, "..", "..", "..", "assets", "fonts", "heuristicaregular.ttf"), "Heuristica");
GlobalFonts.registerFromPath(path.join(__dirname, "..", "..", "..", "assets", "fonts", "BAKHUM.TTF"), "ArTarumianBakhum");

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TOKEN: string;                          // Discord BOT Token
            DBURI: string;                          // Database URI to use with Sequelize
            MASTER_GUILD: string;                   // Main guild to register bot's commands
            NODE_ENV: 'development' | 'production'; // Runtime environment
            TOPGG_TOKEN: string;                    // Auth token for TopGG bot monitoring
            OSU_API_KEY: string;                    // API key to fetch osu! game stats
            DATA_DIR?: string;                      // Directory path for configuration files 
            LOGS_DIR?: string;                      // Path to directory where to store logs
            ADMIN_ID?: string;                      // Discord user id to pass admin checks
            PROM_PFX?: string;                      // Prometheus metrics prefix
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
    ClassChecker,
    Admin,
    Shakalize,
    MkMeme,
    ContextCategory
]

const dataDir = process.env.DATA_DIR ?? './data';
const logsDir = process.env.LOGS_DIR ?? './logs';

if (!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(logsDir)){
    fs.mkdirSync(logsDir, { recursive: true });
}

let uuids: { [key: string]: string };

/* Load UUIDs from uuids.json, or generate new UUIDs if file doesn't exist. */
if(fs.existsSync(dataDir + "/uuids.json")){
    uuids = JSON.parse(fs.readFileSync(dataDir + "/uuids.json").toString("utf-8"));
}else{
    uuids = {};
    for(let m of modules){
        uuids[m.name] = crypto.randomUUID();
    }
    fs.writeFileSync(dataDir + "/uuids.json", JSON.stringify(uuids, undefined, 4));
}

const modulePairs: ModuleUUIDPair[] = modules.map(m => ({ Module: m, UUID: uuids[m.name] }));

const bot = new Synergy({
    sequelizeURI: process.env.DBURI,
    sequelizeForceSync: false,
    masterGuildId: process.env.MASTER_GUILD,
    moduleGlobalLoading: process.env.NODE_ENV === "production",
    dataSyncDelay: 60,
    logsDir,
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
    GlobalLogger.root.info("Starting Prometheus metrics client...");
    if(process.env.PROM_PORT) {
        Prometheus.startHttpServer(parseInt(process.env.PROM_PORT));
        GlobalLogger.root.info("Started Prometheus metrics client on http://0.0.0.0:" + process.env.PROM_PORT);
    } else {
        Prometheus.startHttpServer();
        GlobalLogger.root.info("Started Prometheus metrics client on http://0.0.0.0:9258");
    }
    let g = Prometheus.createGauge("start_time", "BOT start time");

    const stop = g.startTimer();
    await bot.login(process.env.TOKEN);
    stop();
})();
