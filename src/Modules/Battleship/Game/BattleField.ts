import { FieldCell } from "./FieldCell";
import { EmptyCell } from "./EmptyCell";
import { Ship } from "./Ship";
import { FieldError, FieldErrorReason } from "./Errors/FieldError";
import { ShipCell } from "./ShipCell";

export interface BattleShipDrawFieldSettings {
    emptySymbol?: string;
    shipSymbol?: string;
    emptyBombedSymbol?: string;
    shipBombedSymbol?: string;
    abcdefghij?: string;
    columnSpace?: boolean;
}

export class BattleField {
    private _width: number;
    private _height: number;

    private field: FieldCell[][] = [];

    constructor(width: number, height: number) {
        this._width = width;
        this._height = height;

        this.fill();
    }

    public get width() {
        return this._width;
    }

    public get height() {
        return this._height;
    }

    public fill() {
        this.field = [];

        for(let y = 0; y < this.width; y++) {
            this.field[y] = [];
            for(let x = 0; x < this.height; x++) {
                this.field[y][x] = new EmptyCell(x, y, false);
            }
        }
    }

    public setCell(x: number, y: number, ship: boolean, bombed: boolean) {
        if(x >= this.width || y >= this.height) {
            throw new FieldError(FieldErrorReason.CellOutOfBounds);
        }
        if(ship) {
            //#FIXME hack!
            this.addShip(new Ship(x, y, 1, "vertical"));
            this.bombCell(x, y);
        } else {
            this.field[y][x] = new EmptyCell(x, y, bombed);
        }
    }

    public getCell(x: number, y: number) {
        return this.field[y][x];
    }

    public setSize(width: number, height: number) {
        this._width = width;
        this._height = height;
        this.fill();
    }

    public removeShip(ship: Ship) {
        let outOfBoundsCell = ship.getCells().find(c => c.x >= this.width || c.y >= this.height);
        if(outOfBoundsCell) {
            throw new FieldError(FieldErrorReason.ShipOutOfBounds);
        }

        for(let c of ship.getCells()) {
            this.field[c.y][c.x] = new EmptyCell(c.x, c.y, false);
        }
    }

    /**
        @returns Deleted ships due to position conflict
     */
    public addShip(ship: Ship): Ship[] {
        let outOfBoundsCell = ship.getCells().find(c => c.x >= this.width || c.y >= this.height);
        if(outOfBoundsCell) {
            throw new FieldError(FieldErrorReason.ShipOutOfBounds);
        }

        let deletedShips = [];

        for(let c of ship.getCells()) {
            let fieldCell = this.field[c.y][c.x];
            if(fieldCell.isShip()) {
                let dShip = fieldCell.getShip();
                this.removeShip(dShip);
                deletedShips.push(dShip);
            }

            this.field[c.y][c.x] = c;
        }

        return deletedShips;
    }

    public getIntersections(ship: Ship) {
        let intersected: FieldCell[] = [];

        for(let c of ship.getCells()) {
            let possiblyIntersected = [
                //Top Left
                this.getCell(c.x - 1, c.y - 1),
                //Top Center
                this.getCell(c.x, c.y - 1),
                //Top Right
                this.getCell(c.x + 1, c.y - 1),
                //Right Center
                this.getCell(c.x + 1, c.y),
                //Bottom Right
                this.getCell(c.x + 1, c.y + 1),
                //Bottom Center
                this.getCell(c.x, c.y + 1),
                //Bottom Left
                this.getCell(c.x - 1, c.y + 1),
                //Left Center
                this.getCell(c.x - 1, c.y),
            ]
            intersected = intersected.concat(possiblyIntersected.filter(ic => ic.isShip() && ic.getShip() !== ship));
        }

        return intersected;
    }

    public bombCell(x: number, y: number): boolean {
        if(x >= this.width || y >= this.height) {
            throw new FieldError(FieldErrorReason.CellOutOfBounds);
        }
        let bombed = this.field[y][x].isBombed();
        this.field[y][x].bomb();
        return this.field[y][x].isShip() && !bombed;
    }

    public draw(settings?: BattleShipDrawFieldSettings) {
        settings = {
            emptySymbol:        settings?.emptySymbol       || "◼️",
            shipSymbol:         settings?.shipSymbol        || "🟪",
            emptyBombedSymbol:  settings?.emptyBombedSymbol || "🔸",
            shipBombedSymbol:   settings?.shipBombedSymbol  || "💥",
            abcdefghij:         settings?.abcdefghij        || "🇦**🇧**🇨**🇩**🇪**🇫**🇬**🇭**🇮**🇯**",
            columnSpace:        settings?.columnSpace       || false
        }

        let field = `${settings.emptySymbol} ${settings.abcdefghij}\n`;
        for(let ys in this.field) {
            let y = parseInt(ys);
            //Add row number at the start
            if(y < 9) {
                field += (y + 1).toString() + String.fromCharCode(65039, 8419);
            } else {
                field += "🔟";
            }
            field += " ";

            for(let cell of this.field[y]) {
                if(cell.isBombed()) {
                    if(cell.isShip()) {
                        field += `${settings.shipBombedSymbol}`;
                    } else {
                        field += `${settings.emptyBombedSymbol}`;
                    }
                } else {
                    if(cell.isShip()) {
                        field += `${settings.shipSymbol}`;
                    } else {
                        field += `${settings.emptySymbol}`;
                    }
                }
                if(settings.columnSpace) {
                    field += " ";
                }
            }
            field += "\n";
        }

        return field;
    }
}