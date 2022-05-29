import { Utils } from "synergy3";
import ItemStack from "../Game/ItemStack";

export default class ShopEntry {
    public price: number = this.minPrice;
    public stock: number = this.minStock;
    public excessCombo: number = 0;
    public shortageCombo: number = 0;
    constructor(public item: ItemStack, public minPrice: number, public minStock: number, public maxStock: number) {

    }

    public calculate(){
        if(this.stock === 0){
            this.excessCombo = 0;
            this.shortageCombo++;
            this.price = this.price * Math.pow(1.25, this.shortageCombo);
        } else if (this.stock >= (this.maxStock / 2)){
            this.shortageCombo = 0;
            this.excessCombo++;
            this.price = this.price * Math.pow(0.8, this.excessCombo);
        } else {
            this.excessCombo = 0;
            this.shortageCombo = 0;
        }

        if(this.price < this.minPrice){
            this.price = this.minPrice;
        }
    }

    public refill(){
        this.stock = Utils.getRandomInt(this.minStock, this.maxStock);
    }
}