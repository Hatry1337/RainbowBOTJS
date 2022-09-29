import Item from "./Item";

export default class ItemPlaceable extends Item {
    public sizeSlots: number = 1;
    constructor(id: string){
        super(id);
        this.is_placeable = true;
    }

    public setSizeSlots(size: number){
        this.sizeSlots = size;
        return this;
    }
}