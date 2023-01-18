import IItemStackObject from "./IItemStackObject";
import IRoomObject from "./IRoomObject";

export default interface IPlayerObject{
    userId: number;
    userDiscordId: string;
    inventory: IItemStackObject[];
    rooms: IRoomObject[];
}