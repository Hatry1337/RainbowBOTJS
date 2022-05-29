import { Synergy, User } from "synergy3";
import IEconomyStorageContainer from "../Game/Interfaces/IEconomyStorageContainer";
import IPlayerObject from "../Game/Interfaces/IPlayerObject";
import ItemPlaceable from "../Game/Items/ItemPlaceable";
import ItemRoom from "../Game/Items/ItemRoom";
import { ItemsMap } from "../Game/Items/ItemsMap";
import ItemStack from "../Game/ItemStack";
import Player from "../Game/Player";
import Room from "../Game/Room";
import CachedInstance from "./CachedInstance";

export class StorageWrapper{
    public cachePlayers: Map<number, CachedInstance<Player>> = new Map();
    private timer: NodeJS.Timeout;
    constructor(public bot: Synergy, private UUID: string){
        this.timer = setInterval(() => {
            this.cachePlayers.forEach((val, key) => {
                if(!val.isValid()){
                    this.cachePlayers.delete(key);
                }
            })
        }, 60000);

        bot.events.once("Stop", () => {
            clearInterval(this.timer);
        });
    }

    public async createRootObject(force: boolean = false){
        let container = await this.bot.modules.data.getContainer(this.UUID);
        let data = container.get("data");
        if(!data || force){
            container.set("data", {
                players: {}
            });
        }
    }

    public async getPlayerData(userId: number): Promise<IPlayerObject | undefined> {
        let container = await this.bot.modules.data.getContainer(this.UUID);
        let data = container.get("data") as IEconomyStorageContainer;
        return data.players[userId];
    }

    public async setPlayerData(userId: number, playerData: IPlayerObject){
        let container = await this.bot.modules.data.getContainer(this.UUID);
        let data = container.get("data") as IEconomyStorageContainer;
        data.players[userId] = playerData;
        container.set("data", data);
    }

    public async getPlayer(user: User, force: boolean = false){
        let pdata = await this.getPlayerData(user.id);
        if(!pdata) return;

        let pcache = this.cachePlayers.get(user.id);
        let player: Player;
        if(!pcache || !pcache.isValid() || force){
            player = new Player(user);
            player.inventory = pdata.inventory.map(i => new ItemStack(ItemsMap.get(i.itemId)!, i.size, i.uuid));
            player.rooms = pdata.rooms.map(r => {
                let room = new Room(ItemsMap.get(r.referenceId) as ItemRoom);
                room.placedItems = r.placedItems.map(i => new ItemStack(ItemsMap.get(i.itemId)! as ItemPlaceable, i.size, i.uuid));
                return room;
            });
            this.cachePlayers.set(user.id, new CachedInstance(player, 30 * 60 * 1000));
        }else{
            player = pcache.instance;
        }
        return player;
    }

    public async savePlayer(player: Player){
        await this.setPlayerData(player.user.id, player.toObject());
        let pcache = this.cachePlayers.get(player.user.id);
        if(!pcache){
            this.cachePlayers.set(player.user.id, new CachedInstance(player, 30 * 60 * 1000));
        }else{
            pcache.instance = player;
            pcache.cachedAt = new Date();
        }
    }

    public async createPlayer(user: User){
        let player = new Player(user);
        await this.savePlayer(player);
        return player;
    }
}