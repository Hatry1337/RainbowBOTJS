import { Item } from "./Item";

export class ItemTPSMeter extends Item{
    constructor(){
        super("TPS Meter", "This item counts server ticks per second.");
    }
}