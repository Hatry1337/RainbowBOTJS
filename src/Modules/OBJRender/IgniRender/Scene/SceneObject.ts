import { Primitive, v3sum, vec3 } from "../Utils3D.js";
import { Scene } from "./Scene.js";

export default abstract class SceneObject{
    public id: string;
    public name: string;
    public scene!: Scene;
    public position: vec3;
    public rotation: vec3;
    public visible: boolean = true;
    public stateChanged: boolean = true;

    protected constructor(name: string, pos: vec3, rot: vec3){
        this.id = Math.floor(Math.random() * 100000000).toString();
        this.name = name;
        this.position = pos;
        this.rotation = rot;
    }

    public abstract Draw(): Primitive[];
    
    public Rotate(rot: vec3){
        this.rotation = v3sum(this.rotation, rot);
        this.stateChanged = true;
    }

    public SetRotation(rot: vec3){
        this.rotation = rot;
        this.stateChanged = true;
    }

    public Move(distance: vec3){
        this.position = v3sum(this.position, distance);
        this.stateChanged = true;
    }

    public SetPosition(pos: vec3){
        this.position = pos;
        this.stateChanged = true;
    }
}