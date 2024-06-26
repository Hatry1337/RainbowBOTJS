import {GFXContext} from "../IgniRender/build/GFXBackend/GFXContext.js";
import {Scene} from "../IgniRender/build/Scene/Scene.js";
import {v3zero} from "../IgniRender/build/Utils3D.js";
import AxesMarker from "../IgniRender/build/Scene/AxesMarker.js";
import Camera from "../IgniRender/build/Scene/Camera.js";
import IgniRender from "../IgniRender/build/IgniRender.js";

class WebCanvasContext extends GFXContext {
    constructor(canvas) {
    super();
        this.canvas = canvas;
        this.canvas_ctx = this.canvas.getContext("2d", { alpha: false });
    }

    getHeight() {
        return this.canvas.height;
    }
    getWidth() {
        return this.canvas.width;
    }

    drawTriangle(triangle) {
        return this.drawNGon(triangle.points, triangle.color);
    }

    drawNGon(points, color) {
        points = points.map(p => ({
            x: Math.floor(p.x),
            y: Math.floor(p.y),
        }));

        for (let p of points) {
            if(p.x > this.canvas.width + 10 || p.y > this.canvas.height + 10) {
                return this;
            }
        }

        this.canvas_ctx.fillStyle = color ?? "black";

        this.canvas_ctx.beginPath();
        this.canvas_ctx.moveTo(points[0].x, points[0].y);
        for(let i = 1; i < points.length; i++){
            this.canvas_ctx.lineTo(points[i].x, points[i].y);
        }
        this.canvas_ctx.fill();
        return this;
    }
    drawPath(points, color) {
        points = points.map(p => ({
            x: Math.floor(p.x),
            y: Math.floor(p.y),
        }));

        this.canvas_ctx.strokeStyle = color ?? "black";

        this.canvas_ctx.beginPath();
        this.canvas_ctx.moveTo(points[0].x, points[0].y);
        for(let i = 1; i < points.length; i++){
            this.canvas_ctx.lineTo(points[i].x, points[i].y);
        }
        this.canvas_ctx.stroke();
        this.canvas_ctx.closePath();
        return this;
    }
    fillBackground(color) {
        this.canvas_ctx.fillStyle = color;
        this.canvas_ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
        return this;
    }
}

let canvas = document.getElementById("viewport");
let context = new WebCanvasContext(canvas);

let scene = new Scene();
scene.addObject(new AxesMarker("axmarker0", v3zero(), v3zero()));

(async () => {
    let obj = await fetch("/Web/cat.obj");
    let model = IgniRender.LoadOBJModel("cat", await obj.text());
    //model.SetPosition({ x: 0, y: 0, z: 250 })
    //model.SetSize(0.1)
    scene.addObject(model);
})();

let cam = new Camera("camera1", {
    x: -30,
    y: -70,
    z: 400
}, v3zero());

cam.Rotate({
    x: -0.1,
    y: -3,
    z: 0
});

scene.addObject(cam);

cam.renderStyle = "flat";

canvas.addEventListener("click", async ev => {
    await canvas.requestPointerLock();
});

addEventListener("mousemove", async (event) => {
    if(event.buttons === 4) {
        cam.Move({
            x: -event.movementX / 10,
            y: -event.movementY / 10,
            z: 0
        })
    } else if (event.buttons === 0) {
        if (document.pointerLockElement === canvas) {
            cam.Rotate({
                x: event.movementY / 100,
                y: event.movementX / 100,
                z: 0
            });
        }
    } else if(event.buttons === 2 && document.pointerLockElement === canvas) {
        document.exitPointerLock();
    }
});

addEventListener("wheel", (event) => {
    cam.Move({
        x: 0,
        y: 0,
        z: event.deltaY / 10
    })
});

document.addEventListener('keydown', (event) => {
    console.log(event.key);
    switch(event.key){
    case "w": {
            cam.position.z += 0.1;
            break;
        }
    case "s": {
            cam.position.z -= 0.1;
            break;
        }
    case "a": {
            cam.position.x -= 0.1;
            break;
        }
    case "d": {
            cam.position.x += 0.1;
            break;
        }

    case "W": {
            cam.position.z += 1;
            break;
        }
    case "S": {
            cam.position.z -= 1;
            break;
        }
    case "A": {
            cam.position.x -= 1;
            break;
        }
    case "D": {
            cam.position.x += 1;
            break;
        }

    case "ArrowDown": {
            cam.position.y -= 0.1;
            break;
        }
    case "ArrowUp": {
            cam.position.y += 0.1;
            break;
        }

    case "ArrowLeft": {
            cam.rotation.y -= 0.0174533;
            break;
        }
    case "ArrowRight": {
            cam.rotation.y += 0.0174533;
            break;
        }

    // case "+": {
    //         model2.SetSize({
    //             x: model2.size.x + 0.01,
    //             y: model2.size.y + 0.01,
    //             z: model2.size.z + 0.01,
    //         });
    //
    //         break;
    //     }
    // case "-": {
    //         model2.SetSize({
    //             x: model2.size.x - 0.01,
    //             y: model2.size.y - 0.01,
    //             z: model2.size.z - 0.01,
    //         });
    //         break;
    //     }
    //
    // case "O": {
    //         IgniRender.ExportOBJ(model2);
    //         break;
    //     }
    //
    // case "o": {
    //         IgniRender.ExportOBJ(model2, false);
    //         break;
    //     }
    }
}, false);

function download_file(file, name) {
    let blob = new Blob([file], {type: 'text/plain'});
    let url = URL.createObjectURL(blob);

    let hiddenElement = document.createElement('a');

    hiddenElement.href = url;
    hiddenElement.target = '_blank';
    hiddenElement.download = name;
    hiddenElement.click();
}

let frames = 0;
let fps = 0;
setInterval(() => {
    fps = frames;
    frames = 0;
    console.log(fps);
    console.log(`cam_pos: x=${cam.position.x} y=${cam.position.y} z=${cam.position.z}`);
    console.log(`cam_rot: x=${cam.rotation.x} y=${cam.rotation.y} z=${cam.rotation.z}`);
}, 1000);

let flock = false;
setInterval(() => {
    if(flock) return;
    flock = true;
    cam.Render(context);
    frames++;
    flock = false;
});