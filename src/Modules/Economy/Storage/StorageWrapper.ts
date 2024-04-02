import { Synergy, User } from "synergy3";
import IEconomyStorageContainer from "../Game/Interfaces/IEconomyStorageContainer";
import IPlayerObject from "../Game/Interfaces/IPlayerObject";
import IShopEntryData from "../Game/Interfaces/IShopEntryData";
import ItemPlaceable from "../Game/Items/ItemPlaceable";
import ItemBuilding from "../Game/Items/ItemBuilding";
import { ItemsRegistry } from "../Game/Items/ItemsRegistry";
import ItemStack from "../Game/ItemStack";
import Player from "../Game/Player";
import Building from "../Game/Building";
import ShopEntry from "../Shop/ShopEntry";
import CachedManager from "./CachedManager";

export class StorageWrapper extends CachedManager<Player>{
    constructor(public bot: Synergy, private UUID: string){
        super();
        this.cacheStorage.on("del", this.onCacheEntryDeleted.bind(this));
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

    public async getPlayerData(userId: string): Promise<IPlayerObject | undefined> {
        let container = await this.bot.modules.data.getContainer(this.UUID);
        let data = container.get("data") as IEconomyStorageContainer;
        return data.players[userId];
    }

    public async getPlayersData(): Promise<IPlayerObject[]> {
        let container = await this.bot.modules.data.getContainer(this.UUID);
        let data = container.get("data") as IEconomyStorageContainer;
        return Object.values(data.players);
    }

    public async setPlayerData(userId: string, playerData: IPlayerObject){
        let container = await this.bot.modules.data.getContainer(this.UUID);
        let data = container.get("data") as IEconomyStorageContainer;
        data.players[userId] = playerData;
        container.set("data", data);
    }

    public async fetchOne(key: string): Promise<Player | undefined> {
        let pdata = await this.getPlayerData(key);
        if(!pdata) return;

        let user = await this.bot.users.get(key);

        if(!user) return;

        let player = new Player(user);
        player.inventory = pdata.inventory.map(i => new ItemStack(ItemsRegistry.getItem(i.itemId)!, i.size, i.uuid, i.meta));
        player.buildings = pdata.rooms.map(r => {
            let room = new Building(ItemsRegistry.getItem(r.referenceId) as ItemBuilding);
            room.placedItems = r.placedItems.map(i => new ItemStack(ItemsRegistry.getItem(i.itemId)! as ItemPlaceable, i.size, i.uuid, i.meta));
            return room;
        });

        this.cacheStorage.set(key, player);
        return player;
    }

    public async fetchBulk(keys: string[]): Promise<Map<string, Player>> {
        let playerMap = new Map();
        for(let k of keys) {
            let player = await this.fetchOne(k);
            if(player) {
                playerMap.set(k, player);
            }
        }
        return playerMap;
    }

    public async savePlayer(id: string){
        let player = await this.get(id);
        if(player) {
            await this.setPlayerData(player.user.unifiedId, player.toObject());
        }
    }

    public async createPlayer(user: User){
        let player = new Player(user);
        this.cacheStorage.set(user.unifiedId, player);
        await this.savePlayer(user.unifiedId);
        return player;
    }

    public override async destroy() {
        for(let k of this.cacheStorage.keys()) {
            await this.onCacheEntryDeleted(k, this.cacheStorage.get(k)!);
        }
        await super.destroy();
    }

    private async onCacheEntryDeleted(unifiedId: string, player: Player) {
        await this.setPlayerData(unifiedId, player.toObject());
    }
}