import Discord from 'discord.js';
import ICommand from './Commands/ICommand';

/*============Commands Import===============*/
import JoinMgr     from './Commands/JoinMgr/JoinMgr';
import Help        from './Commands/Help/Help';
import Placeholder from './Commands/Placeholder';
import Usage       from './Commands/Usage/Usage';
/*==========================================*/

class CommandsController{
    Commands: ICommand[] = [];
    constructor(){
        this.Commands.push(new JoinMgr(this));
        this.Commands.push(new Help(this));
        this.Commands.push(new Usage(this));

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