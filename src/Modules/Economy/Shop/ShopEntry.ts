import { Utils } from "synergy3";
import ItemStack from "../Game/ItemStack";

export default class ShopEntry {
    public minStock: number = 1;
    public maxStock: number = 5;
    public stock: number = this.minStock;

    public minPrice: number = 10000;
    public price: number = this.minPrice;

    public excessCombo: number = 0;
    public shortageCombo: number = 0;

    constructor(public item: ItemStack) {

    }

    public setMinStock(minStock: number){
        this.minStock = minStock;
        this.stock = minStock;
        return this;
    }

    public setMaxStock(maxStock: number){
        this.maxStock = maxStock;
        return this;
    }

    public setMinPrice(minPrice: number){
        this.minPrice = minPrice;
        this.price = minPrice;
        return this;
    }

    public calculate(){
        if(this.stock === 0){
            this.excessCombo = 0;
            this.shortageCombo++;
            this.price = Math.floor(this.price * Math.pow(1.25, this.shortageCombo));
        } else if (this.stock >= (this.maxStock / 2)){
            this.shortageCombo = 0;
            this.excessCombo++;
            this.price = Math.floor(this.price * Math.pow(0.8, this.excessCombo));
        } else {
            this.excessCombo = 0;
            this.shortageCombo = 0;
        }

        if(this.price < this.minPrice){
            this.price = Math.floor(this.minPrice);
        }
    }

    public refill(){
        this.stock = Utils.getRandomInt(this.minStock, this.maxStock);
    }
}