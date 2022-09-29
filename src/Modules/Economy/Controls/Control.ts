import { Synergy } from "synergy3";
import Economy from "../Economy";
import { StorageWrapper } from "../Storage/StorageWrapper";

export default class Control {
    constructor(public bot: Synergy, protected economy: Economy, protected storage: StorageWrapper){

    }

    public async Init?(): Promise<void>;
    public async Unload?(): Promise<void>;
}