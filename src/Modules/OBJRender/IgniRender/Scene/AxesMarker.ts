import {  PPath, vec3 } from "../Utils3D";
import SceneObject from "./SceneObject";
import { Scene } from "./Scene";

export default class AxesMarker extends SceneObject{
    constructor(scene: Scene, pos: vec3, rot: vec3){
        super(scene, pos, rot);
    }

    public Draw(): PPath[] {
        let marker: PPath[] = [
            {
                type: "path",
                points: [
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
                ],
                color: "#FF0000"
            },
            {
                type: "path",
                points: [
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
                ],
                color: "#00FF00"
            },
            {
                type: "path",
                points: [
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
                ],
                color: "#0000FF"
            },
        ];
        return marker;
    }
}