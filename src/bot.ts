import 'dotenv/config';
import Discord from "discord.js";
import { Module, RainbowBOT } from "rainbowbot-core";
import EiBall from './Modules/8Ball/8Ball';
import Anek from './Modules/Anek/Anek';
import Mute from './Modules/Mute/Mute';
import OBJRender from './Modules/OBJRender/OBJRender';
import OsuInfo from './Modules/OsuInfo/OsuInfo';
import TicTacToe from './Modules/TicTacToe/TicTacToe';
import { CoreModules } from 'rainbowbot-core';

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TOKEN: string;
            DBURI: string;
            MASTER_GUILD: string;
            NODE_ENV: 'development' | 'production';
        }
    }
}

const modules: {
    UUID: string;
    Module: typeof Module;
}[] = [
    { Module: CoreModules.Avatar,      UUID: "20d84fb5-ecb5-546e-b8c1-d5b6afd5083f"},
    { Module: CoreModules.Config,      UUID: "20d84fb5-ecb5-546e-b8c1-d5b6afd5083f"},
    { Module: CoreModules.Profile,     UUID: "20d84fb5-ecb5-546e-b8c1-d5b6afd5083f"},
    { Module: CoreModules.RHelp,       UUID: "20d84fb5-ecb5-546e-b8c1-d5b6afd5083f"},

    { Module: EiBall,       UUID: "20d84fb5-ecb5-546e-b8c1-d5b6afd5083f"},
    { Module: Anek,         UUID: "7d67a2e9-0f03-5906-a536-17b72777adba"},
    { Module: Mute,         UUID: "ecd7d5d7-d850-5e54-a48b-ecb22bfd72e5"},
    { Module: OBJRender,    UUID: "cbd88a93-01eb-5676-83ba-527b72226f3c"},
    { Module: OsuInfo,      UUID: "0db9c725-0feb-562c-b2d0-827333635c94"},
    { Module: TicTacToe,    UUID: "ef61bc11-cb82-5ecb-b392-ba50db2355ab"},
    
]

const bot = new RainbowBOT({
    sequelizeURI: process.env.DBURI,
    masterGuildId: process.env.MASTER_GUILD,
    moduleGlobalLoading: process.env.NODE_ENV === "production",
    clientOptions: {
        intents: [
            Discord.Intents.FLAGS.DIRECT_MESSAGES,
            Discord.Intents.FLAGS.GUILDS,
            Discord.Intents.FLAGS.GUILD_MESSAGES,
            Discord.Intents.FLAGS.GUILD_MEMBERS,
            
        ],
        presence: {
            status: "online",
            activities: [
                {
                    type: "LISTENING",
                    name: "Slash Commands🐊",
                }
            ]
        }
    }
}, modules);

(async () => {
    await bot.login(process.env.TOKEN);
})();