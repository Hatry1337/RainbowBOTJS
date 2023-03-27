export enum GameStartBattleErrorReason {
    GameAlreadyFinished
}

export class GameStartBattleError extends Error {
    constructor(public reason: GameStartBattleErrorReason) {
        super();
    }
}