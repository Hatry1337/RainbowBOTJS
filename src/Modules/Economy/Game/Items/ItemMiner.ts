import Item from "./Item";
import ItemPowerConsumer from "./ItemPowerConsumer";

export interface IMinerRedeemResult{
    points: number;
    power: number;
    timeDelta: number;
}

export default class ItemMiner extends ItemPowerConsumer {
    public miningRate: number = 5;
    constructor(id: string){
        super(id);
    }

    public setMiningRate(miningRate: number){
        this.miningRate = miningRate;
        return this;
    }

    public redeemPoints(lastRedeem: Date): IMinerRedeemResult {
        let delta = Math.floor((new Date().getTime() - lastRedeem.getTime()) / 1000);
        let points = (delta / 60 / 60) * this.miningRate; // CPT/Hour
        let power = (delta / 60 / 60) * this.powerConsumption; //Power W*h

        return {
            power,
            points,
            timeDelta: delta
        };
    }
}