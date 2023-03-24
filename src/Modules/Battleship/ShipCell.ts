import { FieldCell } from "./FieldCell";
import { Ship } from "./Ship";

export class ShipCell extends FieldCell {
    private readonly ship: Ship;
    constructor(x: number, y: number, isBombed: boolean, ship: Ship) {
        super(x, y, isBombed, true);
        this.ship = ship;
    }

    public getShip() {
        return this.ship;
    }
}