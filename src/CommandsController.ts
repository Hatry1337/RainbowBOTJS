import Discord from 'discord.js';
import ICommand from './Commands/ICommand';
import { Guild } from './Models/Guild';
import { User } from './Models/User';
import { ItemStack } from './Models/Economy/ItemStack';
import { Item } from './Models/Economy/Item';

/*============Commands Import===============*/
import JoinMgr       from './Commands/JoinMgr/JoinMgr';
import RHelp          from './Commands/RHelp/RHelp';
import Placeholder   from './Commands/Placeholder';
import Usage         from './Commands/Usage/Usage';
import RBFetch       from './Commands/RBFetch/RBFetch';
import Mute          from './Commands/Mute/Mute';
import UnMute        from './Commands/UnMute/UnMute';
import Config        from './Commands/Config/Config';
import VL            from './Commands/VL/VL';
import LeaveMgr      from './Commands/LeaveMgr/LeaveMgr';
import Clear         from './Commands/Clear/Clear';
import Music         from './Commands/Music/Music';
import Avatar        from './Commands/Avatar/Avatar';
import Anek          from './Commands/Anek/Anek';
import Items         from './Commands/Economy/Items';
import Profile       from './Commands/Economy/Profile';
import Machine       from './Commands/Economy/Machine';

/*==========================================*/

class CommandsController{
    Commands: ICommand[] = [];
    Client: Discord.Client;
    constructor(client: Discord.Client){
        this.Client = client;

        this.Commands.push(new JoinMgr  (this));
        this.Commands.push(new RHelp    (this));
        this.Commands.push(new Usage    (this));
        this.Commands.push(new RBFetch  (this));
        this.Commands.push(new Mute     (this));
        this.Commands.push(new UnMute   (this));
        this.Commands.push(new Config   (this));
        this.Commands.push(new VL       (this));
        this.Commands.push(new LeaveMgr (this));
        this.Commands.push(new Clear    (this));
        this.Commands.push(new Music    (this));
        this.Commands.push(new Avatar   (this));
        this.Commands.push(new Anek     (this));
        this.Commands.push(new Items    (this));
        this.Commands.push(new Profile  (this));
        this.Commands.push(new Machine  (this));
        
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

    FindAndRun(message: Discord.Message): Promise<Discord.Message>{
        return new Promise((resolve, reject) => {
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
                    }, 
                    include: [{ model: ItemStack, include: [Item] }] 
                }))[0];

                user.Tag = message.author.tag;
                user.Avatar = message.author.avatarURL({ format: "png" }) || "No Avatar";
                user.Inventory = user.Inventory || [];
                                
                await user.save();

                for(var cmd of this.Commands){
                    if(cmd.Test(message)){
                        return cmd.Run(message, guild, user).then(resolve).catch(reject);
                    }
                }
                resolve(message);
            }).catch(reject);
        });
    }
}

export = CommandsController;