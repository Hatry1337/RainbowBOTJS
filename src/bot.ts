import CommandsController from "./CommandsController";
import RClient from "./RClient";
import { sequelize } from "./Database";
import { Guild as RGuild } from "./Models/Guild";
import { User as RUser } from "./Models/User";
import { GlobalLogger } from "./GlobalLogger";
import Events from "./Events";

declare module 'discord.js' {
    interface ClientEvents {
        RVoiceChannelJoin: [VoiceChannel, GuildMember],
        RVoiceChannelQuit: [VoiceChannel, GuildMember],
        RVoiceChannelChange: [VoiceChannel, VoiceChannel, GuildMember],
        RGuildMemberAdd: [GuildMember, RGuild, RUser],
        RGuildMemberRemove: [GuildMember | PartialGuildMember, RGuild, RUser],
    }
}

const logger = GlobalLogger.root;
const client = new RClient();
const events = new Events(client);
const commandsController = new CommandsController(client);

(async () => {
    await sequelize.sync({force: false});
    await RUser.findOrCreate({
        where: { 
            ID: "system" 
        }, 
        defaults: { 
            ID: "system", 
            Tag: "System",
            Avatar: "https://cdn.discordapp.com/avatars/571948993643544587/1ae2abe89523db2a74205763887e3e60.webp",
            Group: "Admin"
        }
    });
    logger.info(`Database Synchronized.`);
    logger.info(`Loggining to BOT Account...`);
    await client.login(process.env.TOKEN);
    logger.info(`Loggined In! (${client.user?.tag})`);
})();

process.on("SIGINT", async () => {
    logger.info(`Accepted SIGINT. Running soft unload.`);
    for(let c of commandsController.Commands){
        if(c.UnLoad){
            await c.UnLoad();
        }
    }
    logger.info(`Commands unloaded. Destroying client.`);
    client.destroy();
    logger.info(`Clinet destroyed. Disconnecting Database.`)
    await sequelize.close();
    logger.info(`Soft unload successfully ended.`);
    process.exit(0);
});