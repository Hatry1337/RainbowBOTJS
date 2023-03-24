import { FieldCell } from "./FieldCell";
import { EmptyCell } from "./EmptyCell";
import { Ship } from "./Ship";

export class BattleField {
    private width: number;
    private height: number;

    private field: FieldCell[][] = [];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.fill();
    }

    public fill() {
        this.field = [];

        for(let x = 0; x < this.width; x++) {
            this.field[x] = [];
            for(let y = 0; y < this.height; y++) {
                this.field[x][y] = new EmptyCell(x, y, false, false);
            }
        }
    }

    public setSize(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.fill();
    }

    public removeShip(ship: Ship) {
        for(let c of ship.getCells()) {
            if(c.x >= this.width || c.y >= this.height) {
                throw new Error(`Ship is out of field bounds (x: ${c.x}, y: ${c.y})`);
            }

            this.field[c.x][c.y] = new EmptyCell(c.x, c.y, false, false);
        }
    }

    public addShip(ship: Ship) {
        for(let c of ship.getCells()) {
            if(c.x >= this.width || c.y >= this.height) {
                throw new Error(`Ship is out of field bounds (x: ${c.x}, y: ${c.y})`);
            }

            let fieldCell = this.field[c.x][c.y];
            if(fieldCell.isShip()) {
                this.removeShip(fieldCell.getShip());
            }

            this.field[c.x][c.y] = c;
        }
    }

    public bombCell(x: number, y: number): boolean {
        if(x >= this.width || y >= this.height) {
            return false;
        }
        let bombed = this.field[x][y].isBombed();
        this.field[x][y].bomb();
        return this.field[x][y].isShip() && !bombed;
    }
}