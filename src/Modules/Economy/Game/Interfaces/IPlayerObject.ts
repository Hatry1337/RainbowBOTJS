import IItemStackObject from "./IItemStackObject";
import IRoomObject from "./IRoomObject";

export default interface IPlayerObject{
    userId: string;
    userDiscordId?: string;
    inventory: IItemStackObject[];
    rooms: IRoomObject[];
}