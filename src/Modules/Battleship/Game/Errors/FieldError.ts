export enum FieldErrorReason {
    CellOutOfBounds,
    ShipOutOfBounds,
}

export class FieldError extends Error {
    constructor(public reason: FieldErrorReason) {
        super();
    }
}