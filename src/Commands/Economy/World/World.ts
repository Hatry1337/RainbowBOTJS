import EventEmitter from "events";
import { Player } from "../inventory/Player";
import { FurnaceRecipes } from "../Items/crafting/FurnaceRecipes";
import { Items } from "../Items/Items";
import { Room } from "../Rooms/Room";
import { TEChest } from "../TileEntitys/TEChest";
import { TEFurnace } from "../TileEntitys/TEFurnace";
import { TileEntity } from "../TileEntitys/TileEntity";
import { TPSMeter } from "../TileEntitys/TPSMeter";

export declare interface World{
    on(event: 'tick', listener: () => void): this;
} 

export class World extends EventEmitter{
    public static WORLD: World = new World();
    public static furnaceRecipes: FurnaceRecipes = new FurnaceRecipes(); 

    private rooms: Map<string, Room> = new Map();
    private ticker: NodeJS.Timeout;
    private ticks: number = 0;
    private players: Map<string, Player> = new Map();
   
    
    public static get currentTick() : number {
        return Math.floor(new Date().getTime() / 500);
    }
    
    constructor(){
        super();

        this.ticker = setInterval(async () => {
            this.emit("tick");
            this.ticks++;
            
            for(var e of this.rooms.entries()){
                for(var m of e[1].getMechs()){
                    m.update();
                }
            }
        }, 500);
    }

    static {
        TileEntity.REGISTRY.putObject("te:furnace", TEFurnace, Items.FURNACE);
        TileEntity.REGISTRY.putObject("te:tpsmeter", TPSMeter, Items.TPS_METER);
        TileEntity.REGISTRY.putObject("te:chest", TEChest, Items.CHEST);
    }

    public getTileEntity(roomid: string, index: number){
        return this.rooms.get(roomid)?.getMech(index);
    }

    public setRoom(roomid: string, room: Room){
        this.rooms.set(roomid, room);
    }

    public delRoom(roomid: string){
        this.rooms.delete(roomid);
    }

    public getRoom(roomid: string){
        return this.rooms.get(roomid);
    }

    public getRooms(){
        var arr = [];
        for(var e of this.rooms.entries()){
            arr.push(e[1]);
        }
        return arr;
    }

    public getOwnedRooms(id: string){
        var arr = [];
        for(var e of this.rooms.entries()){
            if(e[1].getOwner().getUser().ID === id){
                arr.push(e[1]);
            }
        }
        return arr;
    }

    public getPlayerRooms(id: string){
        var arr = [];
        for(var e of this.rooms.entries()){
            if(e[1].getOwner().getUser().ID === id){
                arr.push(e[1]);
            }else{
                if(e[1].getMembers().find(m => m.getUser().ID === id)){
                    arr.push(e[1]);
                }
            }
        }
        return arr;
    }

    public setPlayer(id: string, player: Player){
        this.players.set(id, player);
    }

    public getPlayer(id: string){
        return this.players.get(id);
    }

    public getPlayers(){
        var arr = [];
        for(var e of this.players.entries()){
            arr.push(e[1]);
        }
        return arr;
    }

    public async getOrLoadPlayer(id: string){
        if(this.players.has(id)){
            return this.players.get(id)!;
        }else{
            var plr = await Player.createOrLoadFromStorage(id);
            this.players.set(id, plr);
            return plr;
        }
    }
}