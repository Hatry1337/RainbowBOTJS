import Discord from "discord.js";
import { MMiningChannel } from "../../../Models/Economy/MMiningChannel";
import { Player } from "../inventory/Player";
import { Item } from "../Items/Item";
import { MiningOre, OreRegistry } from "../Registrys/OreRegistry";

export class MiningChannel{
    private vchannel: Discord.VoiceChannel;
    private tchannel: Discord.TextChannel | Discord.NewsChannel | Discord.DMChannel;
    private players: Player[];
    private ores: MiningOre[];
    private mmc: MMiningChannel;

    constructor(mmc: MMiningChannel, vc: Discord.VoiceChannel, tc: Discord.TextChannel | Discord.NewsChannel | Discord.DMChannel, players: Player[] = [], ores: MiningOre[] = []){
        this.mmc = mmc;
        this.vchannel = vc;
        this.tchannel = tc;
        this.players = players;
        this.ores = ores;
    }

    private defaultOreGenerator(){
        var ores: MiningOre[] = [];
        var reg = OreRegistry.REGISTRY.getOres();

        while(ores.length === 0){
            for(var r of reg){
                if(Math.random() <= r.GenChance){
                    ores.push(r);
                }
            }
        }

        return ores;
    }

    public regenOres(generator: () => MiningOre[] = this.defaultOreGenerator){
        this.ores = generator();
    }

    public getVoiceChannel(){
        return this.vchannel;
    }

    public getTextChannel(){
        return this.tchannel;
    }

    public getPlayers(){
        return this.players;
    }

    public addPlayer(player: Player){
        if(!this.players.find(p => p.getUser().ID === p.getUser().ID)){
            this.players.push(player);
        }
    }

    public rmPlayer(player: Player){
        var i = this.players.findIndex(u => u.getUser().ID === player.getUser().ID);
        if(i !== -1){
            this.players.splice(i, 1);
        }
    }

    public hasPlayer(user: Player){
        var i = this.players.findIndex(u => u.getUser().ID === user.getUser().ID);
        return i !== -1;
    }

    public getOres(){
        return this.ores;
    }

    public getOre(index: number){
        if(index < this.ores.length && index >= 0){
            return this.ores[index];
        }
    }

    public addOre(ore: MiningOre){
        if(this.ores.indexOf(ore) === -1){
            this.ores.push(ore);
        }
    }

    public rmOre(item: Item){
        var i = this.ores.findIndex(o => o.Ore === item);
        if(i !== -1){
            this.ores.splice(i, 1);
        }
    }

    public hasOre(item: Item){
        var i = this.ores.findIndex(o => o.Ore === item);
        return i !== -1;
    }

    public static async createOrLoadFromStorage(id: string, vc: Discord.VoiceChannel, tc: Discord.TextChannel | Discord.NewsChannel | Discord.DMChannel, players: Player[] = [], ores: MiningOre[] = []){
        var mmc = await MMiningChannel.findOrCreate({
            where: {
                guildID: id
            },
            defaults: {
                guildID: id,
                voiceChanlID: vc.id,
                textChanlID: tc.id,

            }
        });
        return new MiningChannel(mmc[0], vc, tc, players, ores);
    }
    
    public async save(){
        this.mmc.setOres(this.ores);
        await this.mmc.save();
    }
}