import { Path, vec3 } from "../Utils3D";
import SceneObject from "./SceneObject";
import { Scene } from "./Scene";

export default class AxesMarker extends SceneObject{
    constructor(name: string, pos: vec3, rot: vec3){
        super(name, pos, rot);
    }

    public Draw(): Path[] {
        let marker: Path[] = [
            new Path([
                {
                    x: this.position.x,
                    y: this.position.y,
                    z: this.position.z
                },
                {
                    x: this.position.x + 0.1,
                    y: this.position.y,
                    z: this.position.z
                },
            ], "#FF0000"),

            new Path([
                {
                    x: this.position.x,
                    y: this.position.y,
                    z: this.position.z
                },
                {
                    x: this.position.x,
                    y: this.position.y + 0.1,
                    z: this.position.z
                },
            ], "#00FF00"),
            
            new Path([
                {
                    x: this.position.x,
                    y: this.position.y,
                    z: this.position.z
                },
                {
                    x: this.position.x,
                    y: this.position.y,
                    z: this.position.z + 0.1
                },
            ], "#0000FF")
        ];
        return marker;
    }
}