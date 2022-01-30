import Discord from 'discord.js';
import IModule from './Commands/IModule';
import { Guild } from './Models/Guild';
import { User } from './Models/User';
import RainbowBOT from './RainbowBOT';

/*============Commands Import===============*/
import JoinMgr          from './Commands/JoinMgr/JoinMgr';
import RHelp            from './Commands/RHelp/RHelp';
import Placeholder      from './Commands/Placeholder';
import Usage            from './Commands/Usage/Usage';
import RBFetch          from './Commands/RBFetch/RBFetch';
import Mute             from './Commands/Mute/Mute';
import UnMute           from './Commands/UnMute/UnMute';
import Config           from './Commands/Config/Config';
import VL               from './Commands/VL/VL';
import LeaveMgr         from './Commands/LeaveMgr/LeaveMgr';
import Clear            from './Commands/Clear/Clear';
import Music            from './Commands/Music/Music';
import Avatar           from './Commands/Avatar/Avatar';
import Anek             from './Commands/Anek/Anek';
import Servers          from './Commands/Servers/Servers';
import Economy          from './Commands/Economy/Commands/Economy';
import Module           from './Commands/Module/Module';
import Chusr            from './Commands/Chusr/Chusr';
import EiBall           from './Commands/8Ball/8Ball';
import Command          from './Commands/Command';
import OsuInfo          from './Commands/OsuInfo/OsuInfo';
import VoiceStats from './Commands/VoiceStats/VoiceStats';
import { GlobalLogger } from './GlobalLogger';

/*==========================================*/

export default class ModuleManager{
    public Modules: IModule[] = [];
    private NameMap: Map<string, typeof Command> = new Map();

    constructor(public bot: RainbowBOT){
        this.RegisterModule(JoinMgr,        "JoinMgr",      true);
        this.RegisterModule(RHelp,          "RHelp",        true);
        this.RegisterModule(Usage,          "Usage",        true);
        this.RegisterModule(RBFetch,        "RBFetch",      true);
        this.RegisterModule(Mute,           "Mute",         true);
        this.RegisterModule(UnMute,         "UnMute",       true);
        this.RegisterModule(Config,         "Config",       true);
        this.RegisterModule(VL,             "VL",           true);
        this.RegisterModule(LeaveMgr,       "LeaveMgr",     true);
        this.RegisterModule(Clear,          "Clear",        true);
        this.RegisterModule(Music,          "Music",        true);
        this.RegisterModule(Avatar,         "Avatar",       true);
        this.RegisterModule(Anek,           "Anek",         true);
        this.RegisterModule(Servers,        "Servers",      true);
        this.RegisterModule(Economy,        "Economy",      false);
        this.RegisterModule(Module,         "Module",       true);
        this.RegisterModule(Chusr,          "Chusr",        true);
        this.RegisterModule(EiBall,         "EiBall",       true);
        this.RegisterModule(OsuInfo,        "OsuInfo",      true);
        this.RegisterModule(VoiceStats,     "VoiceStats",   true);

        bot.client.on("interactionCreate", interaction => {
            if(interaction.isCommand()){
                
            }
        })
    }

    public RegisterModule(mod: typeof Command, name: string, load: boolean = false){
        this.NameMap.set(name, mod);
        if(load){
            this.Modules.push(new mod(this))
        }
    }

    public Init(){
        return new Promise<number>(async (resolve, reject) => {
            var cmdc = this.Modules.slice(0);
            cmdc.sort((a, b) => ((b.InitPriority || 1) - (a.InitPriority || 1)));
            var count = 0;
            for(var c of cmdc){
                if(c.Init){
                    await c.Init();
                    count++;
                }
            }
            return resolve(count);
        });
    }

    public async LoadModule(name: string){
        let mod = this.NameMap.get(name);
        if(!mod) return;
        let cmd = new mod(this);
        this.Modules.push(cmd);
        if(cmd.Init){
            await cmd.Init();
        }
        return cmd;
    }

    public async UnloadModule(cmd: IModule){
        let i = this.Modules.indexOf(cmd);
        if(i !== -1){
            if(cmd.UnLoad){
                await cmd.UnLoad()
            }
            this.Modules.splice(i, 1);
        }
    }

    public async ReloadModule(cmd: IModule){
        let i = this.Modules.indexOf(cmd);
        if(i !== -1){
            this.UnloadModule(cmd);
            this.LoadModule(cmd.Name);
        }
    }

    public IsModuleExist(name: string){
        return this.NameMap.has(name);
    }

    public FindAndRun(interaction: Discord.Interaction): Promise<Discord.Message | undefined>{
        return new Promise((resolve, reject) => {
            let module = this.Modules.find(m => m.Test(interaction));
            if(!module){
                return resolve(undefined);
            }
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
        });
    }
}
