import IItemStackObject from "./IItemStackObject";
import IRoomObject from "./IRoomObject";

export default interface IPlayerObject{
    userId: number;
    inventory: IItemStackObject[];
    rooms: IRoomObject[];
}