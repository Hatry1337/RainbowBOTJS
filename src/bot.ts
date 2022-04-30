import 'dotenv/config';
import Discord from "discord.js";
import { Module, Synergy } from "synergy3";
import { CoreModules } from "synergy3";

import EiBall from './Modules/8Ball/8Ball';
import Anek from './Modules/Anek/Anek';
import Mute from './Modules/Mute/Mute';
import OBJRender from './Modules/OBJRender/OBJRender';
import OsuInfo from './Modules/OsuInfo/OsuInfo';
import TicTacToe from './Modules/TicTacToe/TicTacToe';
import Clear from './Modules/Clear/Clear';
import RBFetch from './Modules/RBFetch/RBFetch';
import Servers from './Modules/Servers/Servers';
import VoiceStats from './Modules/VoiceStats/VoiceStats';
import MathTools from './Modules/MathTools/MathTools';
import Demotivator from './Modules/Demotivator/Demotivator';
import Quote from './Modules/Quote/Quote';
import GetRole from './Modules/GetRole/GetRole';

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
    { Module: Clear,        UUID: "d287fe1c-362a-5ec1-b844-fd80bc071132"},
    { Module: Mute,         UUID: "ecd7d5d7-d850-5e54-a48b-ecb22bfd72e5"},
    { Module: OBJRender,    UUID: "cbd88a93-01eb-5676-83ba-527b72226f3c"},
    { Module: OsuInfo,      UUID: "0db9c725-0feb-562c-b2d0-827333635c94"},
    { Module: RBFetch,      UUID: "c39c15d5-a7cf-5664-bd67-aaf5ca52f788"},
    { Module: Servers,      UUID: "c988ffed-5578-5121-95c4-7f8b7566f0df"},
    { Module: TicTacToe,    UUID: "ef61bc11-cb82-5ecb-b392-ba50db2355ab"},
    { Module: VoiceStats,   UUID: "6a308390-96a1-5b61-a348-6fdcca0734fe"},
    { Module: MathTools,    UUID: "c9242a7e-9d29-50b8-8f5a-3bf976739d95"},
    { Module: Demotivator,  UUID: "a23ea2ac-6a0e-5cce-99ef-8179276544a3"},
    { Module: Quote,        UUID: "1e0edfbb-8357-525c-b33b-53e71c3a014d"},
    { Module: GetRole,      UUID: "fa04251d-d106-5b30-aba1-b63df36afed8"},
]

const bot = new Synergy({
    sequelizeURI: process.env.DBURI,
    masterGuildId: process.env.MASTER_GUILD,
    moduleGlobalLoading: process.env.NODE_ENV === "production",
    dataSyncDelay: 60,
    clientOptions: {
        intents: [
            Discord.Intents.FLAGS.DIRECT_MESSAGES,
            Discord.Intents.FLAGS.GUILDS,
            Discord.Intents.FLAGS.GUILD_MESSAGES,
            Discord.Intents.FLAGS.GUILD_MEMBERS,
            Discord.Intents.FLAGS.GUILD_VOICE_STATES  
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