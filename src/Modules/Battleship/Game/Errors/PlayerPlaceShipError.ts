export enum PlayerPlaceShipErrorReason {
    ShipOutOfBounds,
    WrongGameStage,
    OutOfShips
}

export class PlayerPlaceShipError extends Error {
    constructor(public reason: PlayerPlaceShipErrorReason) {
        super();
    }
}