import { FieldCell } from "./FieldCell";

export class EmptyCell extends FieldCell {
    constructor(x: number, y: number, isBombed: boolean) {
        super(x, y, isBombed, false);
    }
}