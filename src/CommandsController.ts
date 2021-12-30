import Discord from 'discord.js';
import ICommand from './Commands/ICommand';
import { Guild } from './Models/Guild';
import { User } from './Models/User';

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
import RClient from './RClient';

/*==========================================*/

class CommandsController{
    public Commands: ICommand[] = [];
    public Client: RClient;
    private NameMap: Map<string, typeof Command> = new Map();

    constructor(client: RClient){
        this.Client = client;
        this.Client.CommandsController = this;

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
    }

    RegisterModule(mod: typeof Command, name: string, load: boolean = false){
        this.NameMap.set(name, mod);
        if(load){
            this.Commands.push(new mod(this))
        }
    }

    Init(){
        return new Promise<number>(async (resolve, reject) => {
            var cmdc = this.Commands.slice(0);
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

    async LoadCommand(name: string){
        let mod = this.NameMap.get(name);
        if(!mod) return;
        let cmd = new mod(this);
        this.Commands.push(cmd);
        if(cmd.Init){
            await cmd.Init();
        }
        return cmd;
    }

    async UnLoadCommand(cmd: ICommand){
        let i = this.Commands.indexOf(cmd);
        if(i !== -1){
            if(cmd.UnLoad){
                await cmd.UnLoad()
            }
            this.Commands.splice(i, 1);
        }
    }

    async ReloadCommand(cmd: ICommand){
        let i = this.Commands.indexOf(cmd);
        if(i !== -1){
            this.UnLoadCommand(cmd);
            this.LoadCommand(cmd.Name);
        }
    }

    IsModuleExist(name: string){
        return this.NameMap.has(name);
    }

    IsCommandExist(message: Discord.Message){
        for(var cmd of this.Commands){
            if(cmd.Test(message)){
                return true;
            }
        }
    }

    FindCommand(message: Discord.Message){
        for(var cmd of this.Commands){
            if(cmd.Test(message)){
                return cmd;
            }
        }
    }

    FindAndRun(message: Discord.Message): Promise<Discord.Message | undefined>{
        return new Promise((resolve, reject) => {
            let command = this.Commands.find(c => c.Test(message));
            if(!command){
                return resolve(undefined);
            }
            Guild.findOrCreate({
                where: {
                    ID: message.guild?.id
                },
                defaults: {
                    ID: message.guild?.id,
                    Name: message.guild?.name,
                    OwnerID: message.guild?.ownerID,
                    Region: message.guild?.region,
                    SystemChannelID: message.guild?.systemChannelID,
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

export = CommandsController;