/*
import Discord from "discord.js";
import log4js from "log4js";
import { Module, RainbowBOT, User } from "rainbowbot-core";

const logger = log4js.getLogger("command");

class Chusr extends Module{
    Name:        string = "Chusr";
    Trigger:     string = "!chusr";
    Usage:       string = "`!chusr @user command...`\n\n" +
                          "`!chusr @Thomasss !inv`";

    Description: string = "Using this command BOT Admins can execute commands under someone's user. For debug purposes only.";
    Category:    string = "BOT";
    Author:      string = "Thomasss#9258";

    constructor(bot: RainbowBOT, uuid: string) {
        super(bot, uuid);
        this.SlashCommands.push(
            this.bot.interactions.createCommand(this.Name.toLowerCase(), this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
                .setDescription(this.Description)
                .addUserOption(opt => opt
                    .setName("target")
                    .setDescription("Uset to chuser into")
                    .setRequired(true)    
                )
                .onExecute(this.Run.bind(this))
                .commit()
        );
    }
    
    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!chusr");
    }
    
    Run(interaction: Discord.CommandInteraction, user: User){
        return new Promise<void>(async (resolve, reject) => {
            if(user.Group === "Admin"){
                let args = message.content.split(" ").slice(1);
                if(args.length < 2){
                    return resolve(await message.channel.send(`Too few arguments. Command usage:\n${this.Usage}`));
                }
                let userid = Utils.parseID(args[0]);
                let usr = await message.client.users.resolve(userid);
                if(!usr){
                    return resolve(await Utils.ErrMsg("This user not found.", message.channel));
                }
                let membr = message.guild!.member(usr.id);
                
                let ncont = message.content.slice(this.Trigger.length + args[0].length + 2);

                let msg = new Discord.Message(message.client, {
                    id: message.id,
                    author: usr,
                    member: membr,
                    content: ncont,
                    attachments: message.attachments
                }, message.channel);

                this.Controller.FindAndRun(msg).then(async resp => {
                    if(!resp){
                        return resolve(await Utils.ErrMsg("Command not found.", msg.channel));
                    }
                    return resolve(resp);
                }).catch(reject);
            }else{
                return resolve(await Utils.ErrMsg("You don't have access to this command.", message.channel));
            }
        });
    }
}

export = Chusr;
*/