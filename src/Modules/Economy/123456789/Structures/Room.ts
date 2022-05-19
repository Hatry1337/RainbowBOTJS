import { RegistryEntry } from "../Game/Registry/RegistryEntry";
import { ItemPlaceable } from "./Items/ItemPlaceable";
/*import { Miner } from "./Items/Miner";

export class Room extends RegistryEntry{
    public contents: ItemPlaceable[] = [];
    constructor(public id: number, public name: string, public description: string, public powerGrid: number, public slots: number, public buildTime: number = 0){
        super();
    }

    public getUsedSlots(){
        let size = 0;
        for(let i of this.contents){
            size += i.size;
        }
        return size;
    }

    public getFreeSlots(){
        return this.slots - this.getUsedSlots();
    }

    public getPowerConsumption(){
        let miners = this.contents.filter(i => i instanceof Miner) as Miner[];
        let pwr = 0;
        for(let i of miners){
            pwr += i.powerConsumption;
        }
        return pwr;
    }

    public getMiningRate(){
        let miners = this.contents.filter(i => i instanceof Miner) as Miner[];
        let mrate = 0;
        for(let i of miners){
            mrate += i.miningRate;
        }
        return mrate;
    }

    public placeItem(item: ItemPlaceable){
        if(!item.isPlaceable) return;
        if(this.getUsedSlots() + item.size > this.slots) return;
        this.contents.push(item);
    }

    public removeItem(item: ItemPlaceable){
        let ind = this.contents.findIndex(i => i === item);
        if(ind !== -1){
            this.contents.splice(ind, 1);
        }
    }
}
*/