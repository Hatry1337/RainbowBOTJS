import Discord from 'discord.js';
import RainbowBOT from './RainbowBOT';
import ModuleDataManager from './ModuleDataManager';
import Module from './Modules/Module';
import User from './Structures/User';

/*============Commands Import===============*/
/*
import JoinMgr          from './Modules/JoinMgr/JoinMgr';
import Placeholder      from './Modules/Placeholder';
import Usage            from './Modules/Usage/Usage';
import RBFetch          from './Modules/RBFetch/RBFetch';
import Mute             from './Modules/Mute/Mute';
import UnMute           from './Modules/UnMute/UnMute';
import Config           from './Modules/Config/Config';
import VL               from './Modules/VL/VL';
import LeaveMgr         from './Modules/LeaveMgr/LeaveMgr';
import Clear            from './Modules/Clear/Clear';
import Music            from './Modules/Music/Music';
*/
import Avatar            from './Modules/Avatar/Avatar';
import RHelp             from './Modules/RHelp/RHelp';
import OsuInfo           from './Modules/OsuInfo/OsuInfo';
import EiBall            from './Modules/8Ball/8Ball';
import Anek              from './Modules/Anek/Anek';
import TicTakToe         from './Modules/TicTacToe/TicTacToe';
import OBJRender         from './Modules/OBJRender/OBJRender';
import Servers           from './Modules/Servers/Servers';
import Profile           from './Modules/Profile/Profile';
import Config            from './Modules/Config/Config';
import { GlobalLogger } from './GlobalLogger';

/*
import Economy          from './Modules/Economy/Commands/Economy';
import ModuleCtl        from './Modules/ModuleCtl/ModuleCtl';
import Chusr            from './Modules/Chusr/Chusr';
import Command          from './Modules/Module';
import VoiceStats       from './Modules/VoiceStats/VoiceStats';
*/
/*==========================================*/

export interface ModuleCommonInfo{
    name: string;
    usage: string;
    description: string;
    category: string;
    author: string;
    commands: string[];
    initPriority: number;
}

const Modules: Module[] = [];
const ModuleRegistry: Map<string, typeof Module> = new Map();

export default class ModuleManager{
    public data: ModuleDataManager = new ModuleDataManager(this.bot);

    constructor(public bot: RainbowBOT){
        this.RegisterModule(Avatar,      "5292323a-2567-54d1-a606-08ea18dfcf1f",    true);
        this.RegisterModule(RHelp,       "23fd2739-3c4b-5cb8-9548-c2633fab5575",    true);
        this.RegisterModule(OsuInfo,     "2fdfb8c8-ec55-5ceb-b7f5-461379c65653",    true);
        this.RegisterModule(EiBall,      "a93794ee-c612-56f4-baa1-96d4ed2de822",    true);
        this.RegisterModule(Anek,        "cdb554e5-2521-5ddd-8a8c-de8803bb6542",    true);
        this.RegisterModule(TicTakToe,   "d93e953b-83f0-5bfc-aff9-660d18461a51",    true);
        this.RegisterModule(OBJRender,   "92c48e79-352e-539c-ba0a-4165bf51d36b",    true);
        this.RegisterModule(Servers,     "f44fdb2f-6eb6-5598-bb82-0b2f6dde49ca",    true);
        this.RegisterModule(Profile,     "7d7d4b85-5ddd-56a8-8eeb-96efcecf3be6",    true);
        this.RegisterModule(Config,      "5a8f041d-6102-5b8e-b1c6-6fb7960607b1",    true);

        /*
        this.RegisterModule(JoinMgr,        true);
        this.RegisterModule(Usage,          true);
        this.RegisterModule(RBFetch,        true);
        this.RegisterModule(Mute,           true);
        this.RegisterModule(UnMute,         true);
        this.RegisterModule(Config,         true);
        this.RegisterModule(VL,             true);
        this.RegisterModule(LeaveMgr,       true);
        this.RegisterModule(Clear,          true);
        this.RegisterModule(Music,          true);
        this.RegisterModule(Economy,        false);
        this.RegisterModule(Module,         true);
        this.RegisterModule(Chusr,          true);
        this.RegisterModule(VoiceStats,     true);
        */
    }

    public RegisterModule(mod: typeof Module, uuid: string, load: boolean = false){
        ModuleRegistry.set(uuid, mod);
        if(load){
            let inst = new mod(this, uuid);
            Modules.push(inst);
        }
    }

    public Init(){
        return new Promise<number>(async (resolve, reject) => {
            var cmdc = Modules.slice(0);
            cmdc.sort((a, b) => (b.InitPriority - a.InitPriority));
            var count = 0;
            for(var c of cmdc){
                if(c.Init){
                    GlobalLogger.root.info(`[ModuleInit] Loading "${c.Name}" module`);
                    await c.Init().catch(err => GlobalLogger.root.error(`[ModuleInit] Error loading module "${c.Name}":`, err));
                    count++;
                }
            }
            await this.bot.UpdateSlashCommands(process.env.MASTER_GUILD).catch(reject);
            await this.bot.UpdateSlashCommands("global").catch(reject);
            return resolve(count);
        });
    }

    public CountLoadedModules(){
        return Modules.length;
    }

    public CountModules(){
        return ModuleRegistry.size;
    }

    public GetModuleCommonInfo(){
        let info: ModuleCommonInfo[] = [];
        for(let m of Modules){
            let commands: string[] = [];
            for(let c of m.SlashCommands){
                commands.push(c.name);
            }
            info.push({
                name: m.Name,
                usage: m.Usage,
                description: m.Description,
                author: m.Author,
                category: m.Category,
                initPriority: m.InitPriority,
                commands
            });
        }
        return info;
    }

    public async LoadModule(uuid: string){
        let mod = ModuleRegistry.get(uuid);
        if(!mod) return;
        let cmd = new mod(this, uuid);
        Modules.push(cmd);
        if(cmd.Init){
            await cmd.Init();
        }
        return cmd;
    }

    public async UnloadAllModules(){
        for(let m of Modules){
            if(m.UnLoad){
                await m.UnLoad();
            }
        }
    }

    public async UnloadModule(cmd: Module){
        let i = Modules.indexOf(cmd);
        if(i !== -1){
            if(cmd.UnLoad){
                await cmd.UnLoad()
            }
            Modules.splice(i, 1);
        }
    }

    public async ReloadModule(cmd: Module){
        let i = Modules.indexOf(cmd);
        if(i !== -1){
            this.UnloadModule(cmd);
            this.LoadModule(cmd.Name);
        }
    }

    public FindAndRun(interaction: Discord.CommandInteraction): Promise<Discord.Message | void | undefined>{
        return new Promise(async (resolve, reject) => {
            let user_id = this.bot.users.idFromDiscordId(interaction.user.id);
            let user: User | null = null;
            if(user_id){
                user = await this.bot.users.fetchOne(user_id);
            }
            if(!user){
                user = await this.bot.users.createFromDiscord(interaction.user);
            }
            let module = Modules.find(m => m.Test(interaction, user!));
            if(!module){
                return resolve(undefined);
            }
            return module.Run(interaction, user!).then(resolve).catch(reject);
            /*
            User.findOrCreate({
                

            }).then(async ures => {
                if(interaction.guild){
                    let gres = await Guild.findOrCreate({
                        where: {
                            ID: interaction.guild.id
                        },
                        defaults: {
                            ID: interaction.guild.id,
                            Name: interaction.guild.name,
                            OwnerID: interaction.guild.ownerId,
                            Region: interaction.guild.preferredLocale,
                            SystemChannelID: interaction.guild.systemChannelId,
                            JoinRolesIDs: [],
                        }
                    });
                }

                

                
            }).catch(err => { GlobalLogger.root.error("ModuleManager.FindAndRun Error: ", err, "trace:", GlobalLogger.Trace(err)); return reject(err) });
            Guild.findOrCreate({
                where: {
                    ID: message.guild?.id
                },
                defaults: {
                    ID: message.guild?.id,
                    Name: message.guild?.name,
                    OwnerID: message.guild?.ownerId,
                    Region: message.guild?.preferredLocale,
                    SystemChannelID: message.guild?.systemChannelId,
                    JoinRolesIDs: [],
                }
            }).then(async res => {
                var guild = res[0];
                var user = (await User.findOrCreate({ 
                    defaults: {
                        ID: message.author.id,
                        Tag: message.author.tag,
                        Avatar: message.author.avatarURL({ format: "png" }) || "No Avatar"
                    },
                    where: { 
                        ID: message.author.id
                    }
                }))[0];

                user.Tag = message.author.tag;
                user.Avatar = message.author.avatarURL({ format: "png" }) || "No Avatar";
                                
                await user.save();
                return command!.Run(message, guild, user).then(resolve).catch(reject);
            }).catch(reject);
            */
        });
    }
}
