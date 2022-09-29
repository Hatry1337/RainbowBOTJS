import IgniRender from "../IgniRender";
import { vec3 } from "../Utils3D";

export default class SceneObject{
    public Renderrer: IgniRender;
    public Position: vec3;
    public Rotation: vec3;
    constructor(pos: vec3, rot: vec3, renderrer: IgniRender){
        this.Position = pos;
        this.Rotation = rot;
        this.Renderrer = renderrer;
    }
}