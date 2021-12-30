import Discord from "discord.js";
import CommandsController from "./CommandsController";
import Events from "./Events";
import { GlobalLogger } from "./GlobalLogger";
import { Guild as RGuild } from "./Models/Guild";


const logger = GlobalLogger.root;

export default class RClient extends Discord.Client{
    public CommandsController!: CommandsController;
    public Events!: Events;
    
    constructor(){
        super();
    }

    CacheGuilds(log: boolean = false){
        return new Promise<number>(async (resolve, reject) => {
            let i = 0;
            for(var g of this.guilds.cache){
                if(log){
                    logger.info(`[GC]`, `Caching Guild ${i}/${this.guilds.cache.size}`);
                }
                let gld = await this.guilds.fetch(g[0], true, true).catch(err => {
                    if(err.code === 50001){
                        logger.warn(`[GC]`, g[0], 'Guild Fetch Error: Missing Access');
                    }else{
                        logger.warn(`[GC]`, 'Guild Fetch Error:', err);
                    }
                });
                if(gld){
                    let res = await RGuild.findOrCreate({
                        where: {
                            ID: gld.id
                        },
                        defaults: {
                            ID: gld.id,
                            Name: gld.name,
                            OwnerID: gld.ownerID,
                            Region: gld.region,
                            SystemChannelID: gld.systemChannelID,
                            JoinRolesIDs: [],
                        }
                    }).catch(e => {
                        logger.warn(`[GC]`, 'Guild Save Error:', e);
                    });

                    if(res && res[1]){
                        var guild = res[0];
                        guild.Name = gld!.name;
                        guild.OwnerID = gld!.ownerID;
                        guild.Region = gld!.region;
                        guild.SystemChannelID = gld!.systemChannelID ? gld!.systemChannelID : undefined;
                        await guild.save();
                    }
                }
                i++;
            }
            return resolve(i);
        });
    }
}