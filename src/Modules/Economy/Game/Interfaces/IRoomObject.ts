import IItemStackObject from "./IItemStackObject";

export default interface IRoomObject{
    referenceId: number;
    placedItems: IItemStackObject[];
}