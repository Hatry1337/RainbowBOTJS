export enum PlayerBombEnemyErrorReason {
    PlayerIndexOutOfRange,
    WrongGameStage,
    WrongGameMove,
    CellAlreadyBombed,
    PositionOutOfBounds,
}

export class PlayerBombEnemyError extends Error {
    constructor(public reason: PlayerBombEnemyErrorReason) {
        super();
    }
}