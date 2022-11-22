import { Face, Primitive, v3sum, vec3 } from "../Utils3D";
import { Scene } from "./Scene";
import crypto from "crypto";

export default abstract class SceneObject{
    public id: string;
    public scene!: Scene;
    public position: vec3;
    public rotation: vec3;
    public visible: boolean = true;
    public stateChanged: boolean = true;

    constructor(pos: vec3, rot: vec3){
        this.id = crypto.randomUUID();
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