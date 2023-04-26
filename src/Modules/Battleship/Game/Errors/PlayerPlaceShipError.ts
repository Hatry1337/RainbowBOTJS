export enum PlayerPlaceShipErrorReason {
    ShipOutOfBounds,
    WrongGameStage,
    OutOfShips,
    ShipIntersected,
}

export class PlayerPlaceShipError extends Error {
    constructor(public reason: PlayerPlaceShipErrorReason) {
        super();
    }
}