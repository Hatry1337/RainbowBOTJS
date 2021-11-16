import Discord from "discord.js";
import ICommand from "../../ICommand";
import { Guild } from "../../../Models/Guild";
import { Emojis, Colors, Utils } from "../../../Utils";
import CommandsController from "../../../CommandsController";
import log4js from "log4js";
import { User } from "../../../Models/User";
import { TPSMeter } from "../TileEntitys/TPSMeter";
import { Player } from "../inventory/Player";
import { MPlayer } from "../../../Models/Economy/MPlayer";
import { World } from "../World/World";
import { Room } from "../Rooms/Room";
import { MRoom } from "../../../Models/Economy/MRoom";
import Rooms         from './Rooms';
import Invent from './Invent';

const logger = log4js.getLogger("economy");

class Economy implements ICommand{
    Name:        string = "Economy";
    Trigger:     string = "!economy";
    Usage:       string = "`!economy`";

    Description: string = "Info and guidelines about economy game.";
    Category:    string = "Economy";
    Author:      string = "Thomasss#9258";
    Controller: CommandsController


    constructor(controller: CommandsController) {
        this.Controller = controller; 
        this.Controller.Commands.push(new Rooms(this.Controller));
        this.Controller.Commands.push(new Invent(this.Controller));
        /*
        for(var i = 0; i < 0; i++){
            var fnc = new TEFurnace();
            TileEntity.REGISTRY.register(TileEntity.REGISTRY.getLastUsedId()+1, "te:furnace", fnc);
            furnace.setInventorySlotContents(0, new ItemStack(Items.IRON_ORE, 4));
            furnace.setInventorySlotContents(1, new ItemStack(Items.COAL));
        }
        */
    }

    async saveWorld(){
        logger.info(`Saving World...`);
        for(var r of World.WORLD.getRooms()){
            var res = await MRoom.findOrCreate({
                where:{
                    name: r.getName()
                },
                defaults:{
                    name: r.getName(),
                    ownerID: r.getOwner().getUser().ID,                            
                },
                include: [
                    { model: MPlayer, as: "Owner", include: [ { model: User, as: "User" } ] },
                    { model: MPlayer, as: "Members", include: [ { model: User, as: "User" } ] }
                ]
            });
            var room = res[0];
            if(!res[1]){
                room.set("ownerID", r.getOwner().getUser().ID);
            }
            var mems: MPlayer[] = [];
            for(var m of r.getMembers()){
                var mem = await MPlayer.findOne({where: {userID: m.getUser().ID}, include: [User]});
                if(mem){
                    mems.push(mem);
                }
            }
            room.$set("Members", mems);
            room.setMechs(r.getMechs());
            await room.save();
        }

        for(var p of World.WORLD.getPlayers()){
            let res = await MPlayer.findOrCreate({
                where:{
                    userID: p.getUser().ID
                },
                defaults:{
                    userID: p.getUser().ID,
                    inventory: [],                            
                },
                include: [
                    { model: User, as: "User" },
                    { model: MRoom, as: "Rooms", include: [ 
                        { model: MPlayer, as: "Owner", include: [ 
                            { model: User, as: "User" } 
                        ]}, 
                        { model: MPlayer, as: "Members", include: [ 
                            { model: User, as: "User" } 
                        ]}
                    ]}
                ]
            });
            let mplr = res[0];
            mplr.setInventory(p.getInventory());
            await mplr.save();
        }
        logger.info(`World Saved!`);
    }

    Init(){
        return new Promise<void>(async (resolve, reject) => {
            var mplr = await MPlayer.findAll({include: [User]});
            for(var m of mplr){
                World.WORLD.setPlayer(m.User.ID, new Player(m));
            }
    
            var rooms = await MRoom.findAll({include: [
                { model: MPlayer, as: "Owner", include: [ { model: User, as: "User" } ] },
                { model: MPlayer, as: "Members", include: [ { model: User, as: "User" } ] }
            ]});
            for(var r of rooms){
                var ownr: Player = await World.WORLD.getOrLoadPlayer(r.ownerID);
                var mems: Player[] = [];
                for(var m of r.Members){
                    mems.push(await World.WORLD.getOrLoadPlayer(m.User.ID));
                }
                World.WORLD.setRoom(r.name, new Room(r.name, ownr, mems, r.getMechs()));
            }

            setInterval(this.saveWorld, 20 * 1000);

            var sys = World.WORLD.getRoom("system_room");
            if(!sys){
                return logger.warn("No sysroom for tps meter!");
            }

            var tps = new TPSMeter();
            sys.addMechs(tps);
            World.WORLD.on("tick", () => {
                if(World.currentTick % 120 === 0){
                    logger.info("Current World TPS:", tps.getTPS());
                }
            });

            /*
            var thomas = World.WORLD.getPlayer("508637328349331462");
            if(thomas){
                thomas.addItem(new ItemStack(Items.COAL, 20));
            }
            */

            return resolve();
        });
    }
    
    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!economy");
    }
    
    Run(message: Discord.Message, guild: Guild, user: User){
        return new Promise<Discord.Message>(async (resolve, reject) => {
            return resolve(await Utils.ErrMsg("Not implemented yet.", message.channel));
        });
    }
}

export = Economy;