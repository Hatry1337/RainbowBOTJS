import IgniRender from "./IgniRender/IgniRender";
import fs from "fs/promises";
import Camera from "./IgniRender/Scene/Camera";
import { v3zero } from "./IgniRender/Utils3D";
import WebSocket from "ws";
import { Scene } from "./IgniRender/Scene/Scene";
import AxesMarker from "./IgniRender/Scene/AxesMarker";

(async() => {
    const wsServer = new WebSocket.Server({port: 9000});
    let scene = new Scene();

    scene.addObject(new AxesMarker(scene, v3zero(), v3zero()));

    //let model2 = igni.LoadOBJModel(await (await fs.readFile("/home/thomas/Документы/Blends/aaa.obj")).toString());
    let model2 = IgniRender.LoadOBJModel(scene, await (await fs.readFile("/home/thomas/Документы/Blends/coctus.obj")).toString());
    model2.SetSize({ x: 100, y: 100, z: 100});
    scene.addObject(model2);

    //model.Position.x += 2;
    //model.Rotation.y = -0.0174533 * 90;
    let cam = new Camera(scene, {
        x: 0,
        y: 0,
        z: -5
    }, v3zero());
    scene.addObject(cam);

    let cam2 = new Camera(scene, {
        x: 0,
        y: 0,
        z: 5
    }, v3zero());
    scene.addObject(cam2);

    cam.renderResolution.Width = 960;
    cam.renderResolution.Height = 540;
    cam.renderStyle = "flat";

    cam2.renderResolution.Width = 960;
    cam2.renderResolution.Height = 540;
    cam2.renderStyle = "flat";

    wsServer.on("connection", (client) => {
        client.on("message", (message) => {
            let data = JSON.parse(message.toString());
            if(data.input && data.input.type === "keydown"){
                switch(data.input.key as string){
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
                }
            }else if(data.input && data.input.type === "set_fov"){
                cam.FOV = data.input.value;
            }else if(data.input && data.input.type === "set_fov"){
                cam.FOV = data.input.value;
            }else if(data.input && data.input.type === "set_fov"){
                cam.FOV = data.input.value;
            }
        });
    });

    let fps = 0;
    let frames = 0;
    let last_rendered = true;
    setInterval(function() {
        if(!last_rendered) return;
        last_rendered = false;

        //model2.Rotation.y += 0.0174533;

        let canv = cam.Render();
        let ctx = canv.getContext("2d");
        ctx.fillStyle = "black";
        ctx.fillText(`FPS: ${fps}`, 0, 10);
        ctx.fillText(`CAM_POS_X: ${cam.position.x}`, 0, 30);
        ctx.fillText(`CAM_POS_Y: ${cam.position.y}`, 0, 40);
        ctx.fillText(`CAM_POS_Z: ${cam.position.z}`, 0, 50);
        ctx.fillText(`CAM_FOV: ${cam.FOV}`, 0, 60);

        ctx.fillText(`CAM_ROT_X: ${cam.rotation.x}`, 0, 80);
        ctx.fillText(`CAM_ROT_Y: ${cam.rotation.y}`, 0, 90);
        ctx.fillText(`CAM_ROT_Z: ${cam.rotation.z}`, 0, 100);

        ctx.fillText(`MODEL2_POS_X: ${model2.position.x}`, 0, 120);
        ctx.fillText(`MODEL2_POS_Y: ${model2.position.y}`, 0, 130);
        ctx.fillText(`MODEL2_POS_Z: ${model2.position.z}`, 0, 140);

        ctx.fillText(`MODEL2_ROT_X: ${model2.rotation.x}`, 0, 160);
        ctx.fillText(`MODEL2_ROT_Y: ${model2.rotation.y}`, 0, 170);
        ctx.fillText(`MODEL2_ROT_Z: ${model2.rotation.z}`, 0, 180);

        let idata = canv.toDataURL("image/jpeg"); //.toBuffer();
        for(let c of wsServer.clients){
            c.send(JSON.stringify({ image_data: idata, width: canv.width, height: canv.height }));
        }
        frames++;
        last_rendered = true;
    }, 16);
    setInterval(() => {
        fps = frames;
        console.log(fps);
        frames = 0;
    }, 1000);
})();