import { GFXContext } from "./GFXContext.js";

export abstract class GFXBackend {
    public abstract createContext(width: number, height: number): GFXContext;
}