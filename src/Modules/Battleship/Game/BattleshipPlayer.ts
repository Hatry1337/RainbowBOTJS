import { User } from "synergy3";
import { BattleField } from "./BattleField";
import BattleshipGame from "./BattleshipGame";
import { Ship } from "./Ship";
import { PlayerBombEnemyError, PlayerBombEnemyErrorReason } from "./Errors/PlayerBombEnemyError";
import { PlayerPlaceShipError, PlayerPlaceShipErrorReason } from "./Errors/PlayerPlaceShipError";
import { FieldError, FieldErrorReason } from "./Errors/FieldError";
import { PlayerRemoveShipError, PlayerRemoveShipErrorReason } from "./Errors/PlayerRemoveShipError";

const ShipLimit: { [key: number]: number } = {
    1: 4,
    2: 3,
    3: 2,
    4: 1
}

export class BattleshipPlayer {
    public readonly field: BattleField = new BattleField(10, 10);
    public readonly enemyField: BattleField = new BattleField(10, 10);
    public readonly ships: Ship[] = [];
    public isReady: boolean = false;

    constructor(public readonly user: User, public readonly game: BattleshipGame) {

    }

    public ready() {
        this.isReady = true;
        this.game.checkReady();
    }

    public unready() {
        this.isReady = false;
    }

    public placeShip(ship: Ship) {
        if(this.game.gameStage !== "prepare") {
            throw new PlayerPlaceShipError(PlayerPlaceShipErrorReason.WrongGameStage);
        }
        if(this.ships.filter(s => s.size === ship.size).length >= ShipLimit[ship.size]) {
            throw new PlayerPlaceShipError(PlayerPlaceShipErrorReason.OutOfShips);
        }

        try {
            let deletedShips = this.field.addShip(ship);
            for(let ds of deletedShips) {
                this.ships.splice(this.ships.findIndex(s => s.x === ds.x && s.y === ds.y));
            }
            this.ships.push(ship);
        } catch (e) {
            if(e instanceof FieldError && e.reason === FieldErrorReason.ShipOutOfBounds) {
                throw new PlayerPlaceShipError(PlayerPlaceShipErrorReason.ShipOutOfBounds);
            } else {
                throw e;
            }
        }
    }

    public removeShip(x: number, y: number) {
        if(this.game.gameStage !== "prepare") {
            throw new PlayerRemoveShipError(PlayerRemoveShipErrorReason.WrongGameStage);
        }

        let cell = this.field.getCell(x, y);
        if(!cell.isShip()){
            throw new PlayerRemoveShipError(PlayerRemoveShipErrorReason.CellIsNotShip);
        }

        let ship = cell.getShip();
        this.field.removeShip(ship);
        this.ships.splice(this.ships.findIndex(s => s.x === ship.x && s.y === ship.y));
    }

    public bombEnemy(targetIndex: number, x: number, y: number) {
        if(targetIndex < 0 || targetIndex >= this.game.players.length) {
            throw new PlayerBombEnemyError(PlayerBombEnemyErrorReason.PlayerIndexOutOfRange);
        }
        if(this.game.gameStage !== "battle") {
            throw new PlayerBombEnemyError(PlayerBombEnemyErrorReason.WrongGameStage);
        }
        if(this.game.currentPlayerIndex !== targetIndex) {
            throw new PlayerBombEnemyError(PlayerBombEnemyErrorReason.WrongGameMove);
        }
        if(this.enemyField.getCell(x, y).isBombed()) {
            throw new PlayerBombEnemyError(PlayerBombEnemyErrorReason.CellAlreadyBombed);
        }

        let enemy = this.game.players[targetIndex];

        try {
            let result = enemy.field.bombCell(x, y);
            this.enemyField.setCell(x, y, result, true);

            if(!result) {
                this.game.nextMove();
            }
        } catch (e) {
            if(e instanceof FieldError && e.reason === FieldErrorReason.CellOutOfBounds) {
                throw new PlayerBombEnemyError(PlayerBombEnemyErrorReason.PositionOutOfBounds);
            } else {
                throw e;
            }
        }
    }
}