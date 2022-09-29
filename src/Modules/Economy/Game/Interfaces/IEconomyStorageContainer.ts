import IPlayerObject from "./IPlayerObject";
import IShopEntryData from "./IShopEntryData";

export default interface IEconomyStorageContainer{
    players: {
        [key: number]: IPlayerObject;
    };
    shop: {
        lastChecked: Date;
        items: IShopEntryData[];
    }
}