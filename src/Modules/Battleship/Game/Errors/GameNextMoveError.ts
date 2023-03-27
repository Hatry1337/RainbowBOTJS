export enum GameNextMoveErrorReason {
    WrongGameStage
}

export class GameNextMoveError extends Error {
    constructor(public reason: GameNextMoveErrorReason) {
        super();
    }
}