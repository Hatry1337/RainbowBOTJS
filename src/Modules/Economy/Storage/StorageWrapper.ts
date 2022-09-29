import { Synergy, User } from "synergy3";
import IEconomyStorageContainer from "../Game/Interfaces/IEconomyStorageContainer";
import IPlayerObject from "../Game/Interfaces/IPlayerObject";
import IShopEntryData from "../Game/Interfaces/IShopEntryData";
import ItemPlaceable from "../Game/Items/ItemPlaceable";
import ItemRoom from "../Game/Items/ItemRoom";
import { ItemsRegistry } from "../Game/Items/ItemsRegistry";
import ItemStack from "../Game/ItemStack";
import Player from "../Game/Player";
import Room from "../Game/Room";
import ShopEntry from "../Shop/ShopEntry";
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

    public async saveShopInfo(items: ShopEntry[], lastChecked: Date){
        let objdata: IShopEntryData[] = items.map(i => ({
            itemId: i.item.item.id,
            price: i.price,
            stock: i.stock,
            excessCombo: i.excessCombo,
            shortageCombo: i.shortageCombo
        }));

        let container = await this.bot.modules.data.getContainer(this.UUID);
        let data = container.get("data") as IEconomyStorageContainer;
        if(!data.shop){
            data.shop = {
                lastChecked,
                items: objdata
            }
        }else{
            data.shop.items = objdata;
            data.shop.lastChecked = lastChecked;
        }
        container.set("data", data);
    }

    public async getShopData(): Promise<{ items: IShopEntryData[], lastChecked: Date } | undefined> {
        let container = await this.bot.modules.data.getContainer(this.UUID);
        let data = container.get("data") as IEconomyStorageContainer;
        return data.shop;
    }

    public async getPlayerData(userId: number): Promise<IPlayerObject | undefined> {
        let container = await this.bot.modules.data.getContainer(this.UUID);
        let data = container.get("data") as IEconomyStorageContainer;
        return data.players[userId];
    }

    public async getPlayersData(): Promise<IPlayerObject[]> {
        let container = await this.bot.modules.data.getContainer(this.UUID);
        let data = container.get("data") as IEconomyStorageContainer;
        return Object.values(data.players);
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
            player.inventory = pdata.inventory.map(i => new ItemStack(ItemsRegistry.getItem(i.itemId)!, i.size, i.uuid, i.meta));
            player.rooms = pdata.rooms.map(r => {
                let room = new Room(ItemsRegistry.getItem(r.referenceId) as ItemRoom);
                room.placedItems = r.placedItems.map(i => new ItemStack(ItemsRegistry.getItem(i.itemId)! as ItemPlaceable, i.size, i.uuid, i.meta));
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