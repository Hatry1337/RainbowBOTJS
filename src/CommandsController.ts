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
/*==========================================*/

class CommandsController{
    Commands: ICommand[] = [];
    constructor(){
        this.Commands.push(new JoinMgr  (this));
        this.Commands.push(new RHelp     (this));
        this.Commands.push(new Usage    (this));
        this.Commands.push(new RBFetch  (this));
        this.Commands.push(new Mute     (this));
        this.Commands.push(new UnMute   (this));
        this.Commands.push(new Config   (this));
        this.Commands.push(new VL       (this));
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