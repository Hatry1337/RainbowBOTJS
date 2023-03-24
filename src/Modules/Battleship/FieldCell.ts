import { ShipCell } from "./ShipCell";
import { EmptyCell } from "./EmptyCell";

export abstract class FieldCell {
    public readonly x: number;
    public readonly y: number;
    private readonly is_ship: boolean;
    private is_bombed: boolean;

    constructor(x: number, y: number, isBombed: boolean, isShip: boolean) {
        this.x = x;
        this.y = y;
        this.is_bombed = isBombed;
        this.is_ship = isShip;
    }

    public isBombed() {
        return this.is_bombed;
    }

    public bomb() {
        this.is_bombed = true;
    }

    public isShip(): this is ShipCell {
        return this.is_ship;
    }

    public isEmpty(): this is EmptyCell {
        return !this.is_ship;
    }
}