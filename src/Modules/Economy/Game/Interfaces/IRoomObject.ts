import IItemStackObject from "./IItemStackObject";

export default interface IRoomObject{
    referenceId: string;
    placedItems: IItemStackObject[];
}