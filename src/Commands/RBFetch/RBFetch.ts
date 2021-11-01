import Discord from "discord.js";
import ICommand from "../ICommand";
import { Utils } from "../../Utils";
import CommandsController from "../../CommandsController";
import { User } from "../../Models/User";

class Help implements ICommand{
    Name:        string = "RBFetch";
    Trigger:     string = "!rbfetch";
    Usage:       string = "`!rbfetch`\n\n" +
                          "**Examples:**\n" +
                          "`!rbfetch` - Shows RainbowBOTFetch (like neofetch/screenfetch in linux)\n\n";

    Description: string = "Using this command you can view bot's stats, and it styled to linux's neofetch/screenfetch.";
    Category:    string = "Utility";
    Author:      string = "Thomasss#9258";
    Controller: CommandsController

    constructor(controller: CommandsController) {
        this.Controller = controller;
    }
    
    
    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase() === "!rbfetch";
    }
    
    Run(message: Discord.Message){
        return new Promise<Discord.Message>(async (resolve, reject) => {
            var user = message.author.username.toLowerCase();
            var nodev = process.version;
            var uptime = Utils.formatTime(Math.floor((message.client.uptime || 0) / 1000));
            var ping = message.client.ws.ping;
            var modules = this.Controller.Commands.length;
            var db_users = await User.count();
            var disc_users = 0;
            message.client.guilds.cache.each(guild => disc_users += guild.memberCount);
            var disc_servs = message.client.guilds.cache.size;
            var rq_handl = "N/A"; //TODO
            var rq_handl_d = "N/A"; //TODO
            var rq_handl_h = "N/A"; //TODO
            
            var rbfetch = 
                `\`\`\`apache`                                                                   + "\n" +
                `${user}@rainbowbot.xyz:~$ rbfetch`                                              + "\n" +
                `           ..                               ${user}@rainbowbot.xyz`             + "\n" +
                `          .*(*          ...                 ---------------`                    + "\n" +
                `         ,*/*.          .,/*,               LNG: TypeScript`                    + "\n" +
                `       .*///,.        ..  *///*.            Node: ${nodev}`                     + "\n" +
                `      ,*/////,       ,*,  ,*////*,          Uptime: ${uptime}`                  + "\n" +
                `    .,///////,      .**,. ,*///////,.       WS_Ping: ${ping} ms.`               + "\n" +
                `    ,////////,    .,/,.  .*/////////*.      Modules: ${modules} (cmd)`          + "\n" +
                `   ,*/(//////*.         ,*////////////,     DB_Users: ${db_users}`              + "\n" +
                `   ,*/////////*.      .,*/////////////,.    Discord_Users: ${disc_users}`       + "\n" +
                `   **//////////*,   .**///////////*****,    Discord_Servers: ${disc_servs}`     + "\n" +
                `  .**//**////////****//////************,    Requests_Handled: ${rq_handl}`      + "\n" +
                `   ,******//////////**************,,,,,.    Requests_Handled_1d: ${rq_handl_d}` + "\n" +
                `   ,*//////***************,,,,,,,,,,,,,.    Requests_Handled_1h: ${rq_handl_h}` + "\n" +
                `   .*//////**********,,,,,,,,,,,,,,,,,,.  `                                     + "\n" +
                `    ,//////**,,,,,,,,,,,,,,,,,,,,,,,,,.   `                                     + "\n" +
                `     .********,,,,,,,,,,,,,,,,,,,,,,.     `                                     + "\n" +
                `       .,***,,,,,,,,,,,,,,,,,,,,,,,       `                                     + "\n" +
                `          .,,,,,,,,,,,,,,,,,,,..          `                                     + "\n" +
                `              ............                `                                     + "\n" +
                `\`\`\``                                                                         ;
            
            resolve(await message.channel.send(rbfetch));
        });
    }
}

export = Help;