import { World } from "../World/World";
import { TileEntity } from "./TileEntity";

export class TPSMeter extends TileEntity{

    private lastTime: number = new Date().getTime();
    private tps: number = 0;

    constructor(){
        super();
    }

    public override proto: typeof TileEntity = TPSMeter;

    public getTPS(){
        return this.tps;
    }

    public override update(){
        var t = new Date().getTime();
        if(World.currentTick % 2 === 0){
            this.tps = 1000 / (t - this.lastTime) * 2;
            this.lastTime = t;
        }
    }
}