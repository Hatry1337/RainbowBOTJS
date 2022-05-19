import IPlayerObject from "./IPlayerObject";

export default interface IEconomyStorageContainer{
    players: {
        [key: number]: IPlayerObject;
    };
}