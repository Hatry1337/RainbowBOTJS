import IPlayerObject from "./IPlayerObject";
import IShopEntryData from "./IShopEntryData";

export default interface IEconomyStorageContainer{
    players: {
        [key: string]: IPlayerObject;
    };
    shop: {
        lastChecked: Date;
        items: IShopEntryData[];
    }
}