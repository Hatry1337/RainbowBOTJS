import { ShipCell } from "./ShipCell";

export type ShipOrientation = "vertical" | "horizontal";

export class Ship {
    private readonly x: number;
    private readonly y: number;
    private readonly size: number;
    private readonly orientation: ShipOrientation;
    private readonly cells: ShipCell[] = [];

    constructor(x: number, y: number, size: number, orientation: ShipOrientation) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.orientation = orientation;

        this.generate();
    }

    private generate() {
        let cx = this.x;
        let cy = this.y;

        for(let i = 0; i < this.size; i++) {
            this.cells.push(new ShipCell(cx, cy, false, this));
            this.orientation === "vertical" ? cy++ : cx++;
        }
    }

    public getCells() {
        return this.cells;
    }

    public isDestroyed() {
        let notBombed = false;
        for(let c of this.cells) {
            notBombed = notBombed || !c.isBombed()
        }
        return !notBombed;
    }
}