import Discord from 'discord.js';
import ICommand from './Commands/ICommand';

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
import Anek        from './Commands/Anek/Anek';
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
            for(var cmd of this.Commands){
                if(cmd.Test(message)){
                    return cmd.Run(message).then(resolve).catch(reject);
                }
            }
            resolve(message);
        });
    }
}

export = CommandsController;