export enum PlayerRemoveShipErrorReason {
    WrongGameStage,
    CellIsNotShip,
}

export class PlayerRemoveShipError extends Error {
    constructor(public reason: PlayerRemoveShipErrorReason) {
        super();
    }
}