import { REST } from "@discordjs/rest";
import Discord from "discord.js";
import EventManager from "./EventManager";
import { GlobalLogger } from "./GlobalLogger";
import { Guild as RGuild } from "./Models/Guild";
import ModuleManager from "./ModuleManager";
import { RESTPostAPIApplicationCommandsJSONBody, Routes } from "discord-api-types/v9";
import { SlashCommandBuilder } from "@discordjs/builders";
import UserManager from "./UserManager";
import ConfigManager from "./ConfigManager";

const logger = GlobalLogger.root;

export default class RainbowBOT{
    public events: EventManager;
    public users: UserManager;
    public config: ConfigManager;
    public modules: ModuleManager;

    public client: Discord.Client;
    public rest: REST;
    public SlashCommands: Map<string, SlashCommandBuilder[]> = new Map();

    constructor(options: Discord.ClientOptions){
        this.client = new Discord.Client(options);
        this.rest = new REST({ version: '9' });

        this.events = new EventManager(this);
        this.users = new UserManager(this);
        this.config = new ConfigManager(this);
        this.modules = new ModuleManager(this);
    }

    public login(token: string){
        this.rest.setToken(token);
        return this.client.login(token);
    }

    public PushSlashCommands(commands: SlashCommandBuilder[], guildId: string | "global"){
        this.SlashCommands.set(guildId, this.SlashCommands.has(guildId) ? this.SlashCommands.get(guildId)!.concat(commands) : commands);
    }

    public UpdateSlashCommands(guildId: string = "global"){
        return new Promise<void>(async (resolve, reject) => {
            let data: RESTPostAPIApplicationCommandsJSONBody[] = [];
            for(let c of this.SlashCommands.get(guildId) || []){
                data.push(c.toJSON());
            }
            if(guildId === "global"){
                if(data.length === 0) return;
                await this.rest.put(
                    Routes.applicationCommands(this.client.application!.id),
                    { body: data },
                ).catch(reject);
                return resolve();
            }else{
                if(data.length === 0) return;
                await this.rest.put(
                    Routes.applicationGuildCommands(this.client.application!.id, guildId),
                    { body: data },
                ).catch(reject);
                return resolve();
            }
        });
    }

    public CacheGuilds(log: boolean = false){
        return new Promise<number>(async (resolve, reject) => {
            let i = 0;
            for(var g of this.client.guilds.cache){
                if(log){
                    logger.info(`[GC]`, `Caching Guild ${i}/${this.client.guilds.cache.size}`);
                }
                let gld = await this.client.guilds.fetch({ guild: g[0], force: true, cache: true }).catch(err => {
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
                            OwnerID: gld.ownerId,
                            Region: gld.preferredLocale,
                            SystemChannelID: gld.systemChannelId,
                            JoinRolesIDs: [],
                        }
                    }).catch(e => {
                        logger.warn(`[GC]`, 'Guild Save Error:', e);
                    });

                    if(res && res[1]){
                        var guild = res[0];
                        guild.Name = gld!.name;
                        guild.OwnerID = gld!.ownerId;
                        guild.Region = gld!.preferredLocale;
                        guild.SystemChannelID = gld!.systemChannelId ? gld!.systemChannelId : undefined;
                        await guild.save();
                    }
                }
                i++;
            }
            return resolve(i);
        });
    }
}