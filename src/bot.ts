import 'dotenv/config';
import Discord from "discord.js";
import RainbowBOT from "./RainbowBOT";
import { sequelize } from "./Database";
import { Guild as RGuild } from "./Models/Guild";
import { GlobalLogger } from "./GlobalLogger";
import RUser from "./Structures/User";
import { StorageUser } from "./Models/StorageUser";
import { StorageUserEconomyInfo } from "./Models/StorageUserEconomyInfo";

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

declare module 'discord.js' {
    interface ClientEvents {
        RVoiceChannelJoin:   [VoiceBasedChannel, GuildMember],
        RVoiceChannelQuit:   [VoiceBasedChannel, GuildMember],
        RVoiceChannelChange: [VoiceBasedChannel, VoiceBasedChannel, GuildMember],
        RGuildMemberAdd:     [GuildMember, RGuild, RUser],
        RGuildMemberRemove:  [GuildMember | PartialGuildMember, RGuild, RUser],
    }
}

const logger = GlobalLogger.root;
const bot = new RainbowBOT({
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
});

(async () => {
    await sequelize.sync({force: false});
    let sys = await StorageUser.findOrCreate({
        where: { 
            id: 0
        }, 
        defaults: { 
            id: 0, 
            nickname: "System",
            group: "Admin"
        }
    });
    if(sys[1]){
        await StorageUserEconomyInfo.create({
            id: sys[0].id
        });
    }
    logger.info(`Database Synchronized.`);
    logger.info(`Loggining to BOT Account...`);
    await bot.login(process.env.TOKEN);
    logger.info(`Loggined In! (${bot.client.user?.tag})`);
    await bot.users.updateAssociations();
    await bot.users.fetchOne(0, true);
})();

async function handleExit(){
    logger.info(`Accepted exit signal. Running graceful unload.`);
    await bot.modules.UnloadAllModules();
    logger.info(`Commands unloaded. Stopping Database Updates.`);
    bot.users.stopUpdating();
    await bot.users.syncStorage();
    logger.info(`Database Updates stopped. Destroying client.`);
    bot.client.destroy();
    logger.info(`Clinet destroyed. Disconnecting Database.`);
    await sequelize.close();
    logger.info(`Graceful unload successfully ended.`);
    process.exit(0);
}

process.on("SIGINT", handleExit);
process.on("SIGTERM", handleExit);