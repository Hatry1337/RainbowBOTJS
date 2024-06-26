import { GFXBackend } from "../IgniRender/GFXBackend/GFXBackend";
import { NodeCanvasContext } from "./NodeCanvasContext";

export class NodeCanvasBackend extends GFXBackend {
    public createContext(width: number, height: number): NodeCanvasContext {
        return new NodeCanvasContext(width, height);
    }
}