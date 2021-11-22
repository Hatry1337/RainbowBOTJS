import Discord, { MessageEmbed } from "discord.js";
import ICommand from "../../ICommand";
import { Guild } from "../../../Models/Guild";
import { Emojis, Colors, Utils } from "../../../Utils";
import CommandsController from "../../../CommandsController";
import log4js from "log4js";
import { User } from "../../../Models/User";
import { Player } from "../inventory/Player";
import { World } from "../World/World";
import { MMiningChannel } from "../../../Models/Economy/MMiningChannel";
import { MiningChannel } from "../Mining/MiningChannel";
import { ItemStack } from "../Items/ItemStack";


const logger = log4js.getLogger("command");

class Mining implements ICommand{
    Name:        string = "Mining";
    Trigger:     string = "!mining";
    Usage:       string = "`!mining[ <sub_cmd>]`\n" +
                          "Sub Commands:\n" +
                          "`**NONE**` - Show info about mining on this server.\n" +
                          "`setup` - Setup mining on this server. (Admins).\n" +
                          "Examples:\n" +
                          "`!mining`\n" + 
                          "`!mining setup`";


    Description: string = "Mining managing tool.";
    Category:    string = "Economy";
    Author:      string = "Thomasss#9258";
    InitPriority: number = 99;
    Controller: CommandsController

    MiningChannels: Map<string, MiningChannel> = new Map();

    constructor(controller: CommandsController) {
        this.Controller = controller;

        this.Controller.Client.on("RVoiceChannelJoin", this.onRVoiceChannelJoin.bind(this));
        this.Controller.Client.on("RVoiceChannelQuit", this.onRVoiceChannelQuit.bind(this));
    }

    private async onRVoiceChannelJoin(vc: Discord.VoiceChannel, member: Discord.GuildMember){
        var mining = this.MiningChannels.get(vc.guild.id);
        if(!mining) return;

        var pl = World.WORLD.getPlayer(member.id);
        if(!pl){
            pl = await Player.createOrLoadFromStorageSafe(member.id);
            if(pl) World.WORLD.setPlayer(member.id, pl);
        }
        if(!pl) return;
        
        mining.addPlayer(pl);
    }

    private async onRVoiceChannelQuit(vc: Discord.VoiceChannel, member: Discord.GuildMember){
        var mining = this.MiningChannels.get(vc.guild.id);
        if(!mining) return;

        var pl = World.WORLD.getPlayer(member.id);
        if(!pl){
            pl = await Player.createOrLoadFromStorageSafe(member.id);
            if(pl) World.WORLD.setPlayer(member.id, pl);
        }
        if(!pl) return;
        
        mining.rmPlayer(pl);
    }

    async UnLoad(){
        logger.info(`Unloading '${this.Name}' module:`);
        logger.info("Unsubscribing from RVoiceChannelJoin Event...")
        this.Controller.Client.removeListener("RVoiceChannelJoin", this.onRVoiceChannelJoin);
        logger.info("Unsubscribing from RVoiceChannelQuit Event...")
        this.Controller.Client.removeListener("RVoiceChannelQuit", this.onRVoiceChannelQuit);
    }

    Init(){
        return new Promise<void>(async (resolve, reject) => {
            var mchanls = await MMiningChannel.findAll();
            for(var m of mchanls){
                var voice = await this.Controller.Client.channels.fetch(m.voiceChanlID).catch(e => logger.warn("[Mining] Fetching VC error: ", e)) as Discord.VoiceChannel;
                var text = await this.Controller.Client.channels.fetch(m.textChanlID).catch(e => logger.warn("[Mining] Fetching VC error: ", e)) as Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel;
                if(!voice || !text){
                    continue;
                }

                var players: Player[] = [];
                for(var u of voice.members){
                    var pl = World.WORLD.getPlayer(u[1].id);
                    if(!pl){
                        pl = await Player.createOrLoadFromStorageSafe(u[1].id);
                        if(pl) World.WORLD.setPlayer(u[1].id, pl);
                    }
                    if(!pl) return;

                    players.push(pl);
                }

                var mining = new MiningChannel(m, voice, text, players, m.getOres());
                this.MiningChannels.set(voice.guild.id, mining);
            }

            setInterval(async () => {
                for(var m of this.MiningChannels.entries()){
                    if(!m[1].getVoiceChannel() || !m[1].getTextChannel()){
                        continue;
                    }

                    var plrs = m[1].getPlayers();
                    var ores = m[1].getOres();

                    for(var p of plrs){
                        var ore = Utils.arrayRandElement(ores);
                        if(Math.random() <= ore.DropChance){
                            var count = Utils.getRandomInt(ore.Min, ore.Max);
                            p.addAndStackItem(new ItemStack(ore.Ore, count));
                            await m[1].getTextChannel().send(`**${p.getUser().Tag}** mined \`${ore.Ore.getName()}\` x${count}`);
                        }
                    }
                }
            }, 30000);
            resolve();
        });
    }

    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!mining");
    }
    
    Run(message: Discord.Message, guild: Guild, user: User){
        return new Promise<Discord.Message>(async (resolve, reject) => {
            let args = message.content.split(" ").slice(1);

            switch(args[0]){
                case "setup":{
                    if(!message.member?.hasPermission("ADMINISTRATOR")){
                        return resolve(await Utils.ErrMsg("Only administrators can use this command.", message.channel));
                    }

                    if(!message.guild){
                        return resolve(await Utils.ErrMsg("This command is not allowed in dm.", message.channel));
                    }

                    if(this.MiningChannels.has(message.guild.id)){
                        return resolve(await Utils.ErrMsg("You already have configured Mining Channel. If you want to reconfigure them, delete it and wait for global Mining regeneration (Every 3-5 days).", message.channel));
                    }
                 
                    message.guild.channels.create(`RainbowBOT Mining`, {
                        type: "category"
                    }).then(async cat => {
                        var tx_c = await cat.guild.channels.create("📈info", {
                            type: "text",
                            parent: cat
                        });
        
                        var vc_c = await cat.guild.channels.create("⛏️Mine", {
                            type: "voice",
                            parent: cat
                        });

                        var mining = await MiningChannel.createOrLoadFromStorage(cat.guild.id, vc_c, tx_c);
                        mining.regenOres();
                        await mining.save();
                        this.MiningChannels.set(cat.guild.id, mining);

                        var ores = "Ores in this Mining Channel:\n";
                        for(var o of mining.getOres()){
                            ores += `${o.Ore.getName()} - Count: x${o.Min}-${o.Max}, Chance: ${Math.floor(o.DropChance * 1000) / 10}%\n`;
                        }
                        await (await tx_c.send(ores)).pin();

                        let emb = new MessageEmbed({
                            title: `Successfully configured Mining Channel.`,
                            color: Colors.Noraml
                        });
                        return resolve(await message.channel.send(emb));
                    }).catch(async e => {
                        return resolve(await Utils.ErrMsg("Can't create category and/or channels. Check BOT permissions.", message.channel));
                    });
                    break;
                }

                case "regen": {
                    if(user.Group !== "Admin"){
                        return resolve(await Utils.ErrMsg("Only BOT Admin can use this command.", message.channel));
                    }

                    if(!message.guild){
                        return resolve(await Utils.ErrMsg("This command is not allowed in dm.", message.channel));
                    }

                    var mining = this.MiningChannels.get(message.guild.id);

                    if(!mining){
                        return resolve(await Utils.ErrMsg("Mining Channel is not configured on this server. Call server's administrator to configure it.", message.channel));
                    }

                    mining.regenOres();
                    await mining.save();

                    await message.channel.send(new MessageEmbed({
                        title: `Successfully regenerated ores on this server.`,
                        color: Colors.Noraml
                    }));

                    
                    let txt = `Channel: ${mining.getTextChannel()}\nOres:\n`
                    for(var o of mining.getOres()){
                        txt += `${o.Ore.getName()} - Count: x${o.Min}-${o.Max}, Chance: ${Math.floor(o.DropChance * 1000) / 10}%\n`;
                    }
                    return resolve(await message.channel.send(new MessageEmbed({
                        title: `Mining Channel on ${message.guild.name}`,
                        description: txt,
                        color: Colors.Noraml
                    })));
                }

                default:{
                    if(!message.guild){
                        return resolve(await Utils.ErrMsg("This command is not allowed in dm.", message.channel));
                    }

                    let mining = this.MiningChannels.get(message.guild.id);

                    if(!mining){
                        return resolve(await Utils.ErrMsg("Mining Channel is not configured on this server. Call server's administrator to configure it.", message.channel));
                    }
                    
                    let txt = `Channel: ${mining.getTextChannel()}\nOres:\n`
                    for(var o of mining.getOres()){
                        txt += `${o.Ore.getName()} - Count: x${o.Min}-${o.Max}, Chance: ${Math.floor(o.DropChance * 1000) / 10}%\n`;
                    }

                    let emb = new MessageEmbed({
                        title: `Mining Channel on ${message.guild.name}`,
                        description: txt,
                        color: Colors.Noraml
                    });
                    return resolve(await message.channel.send(emb));
                }
            }
        });
    }
}

export = Mining;