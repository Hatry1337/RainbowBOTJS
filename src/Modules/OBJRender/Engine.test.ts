import IgniRender from "./IgniRender/IgniRender";
import fs from "fs/promises";
import Camera from "./IgniRender/Scene/Camera";
import { v3zero } from "./IgniRender/Utils3D";
import WebSocket from "ws";

(async() => {
    const wsServer = new WebSocket.Server({port: 9000});
    let igni = new IgniRender();
    //let model2 = igni.LoadOBJModel(await (await fs.readFile("/home/thomas/Документы/Blends/aaa.obj")).toString());
    let model2 = igni.LoadOBJModel(await (await fs.readFile("/home/thomas/Документы/Blends/coctus.obj")).toString());

    //model.Position.x += 2;
    //model.Rotation.y = -0.0174533 * 90;
    let cam = new Camera({
        x: 0,
        y: 0,
        z: -5
    }, v3zero(), igni);
    cam.RenderResolution.Width = 960;
    cam.RenderResolution.Height = 540;
    cam.Width = 0.9;
    cam.Height = 1.6;
    cam.RenderStyle = "flat";

    igni.Scene.push(cam);
    //igni.Scene.push(model);
    igni.Scene.push(model2);

    wsServer.on("connection", (client) => {
        client.on("message", (message) => {
            let data = JSON.parse(message.toString());
            if(data.input && data.input.type === "keydown"){
                switch(data.input.key as string){
                    case "w": {
                        cam.Position.z += 0.1;
                        break;
                    }
                    case "s": {
                        cam.Position.z -= 0.1;
                        break;
                    }
                    case "a": {
                        cam.Position.x -= 0.1;
                        break;
                    }
                    case "d": {
                        cam.Position.x += 0.1;
                        break;
                    }
        
                    case "ArrowDown": {
                        cam.Position.y -= 0.1;
                        break;
                    }
                    case "ArrowUp": {
                        cam.Position.y += 0.1;
                        break;
                    }
        
                    case "ArrowLeft": {
                        cam.Rotation.y -= 0.0174533;
                        break;
                    }
                    case "ArrowRight": {
                        cam.Rotation.y += 0.0174533;
                        break;
                    }
                }
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
        ctx.fillText(`CAM_POS_X: ${cam.Position.x}`, 0, 30);
        ctx.fillText(`CAM_POS_Y: ${cam.Position.y}`, 0, 40);
        ctx.fillText(`CAM_POS_Z: ${cam.Position.z}`, 0, 50);

        ctx.fillText(`CAM_ROT_X: ${cam.Rotation.x}`, 0, 70);
        ctx.fillText(`CAM_ROT_Y: ${cam.Rotation.y}`, 0, 80);
        ctx.fillText(`CAM_ROT_Z: ${cam.Rotation.z}`, 0, 90);

        ctx.fillText(`MODEL2_POS_X: ${model2.Position.x}`, 0, 110);
        ctx.fillText(`MODEL2_POS_Y: ${model2.Position.y}`, 0, 120);
        ctx.fillText(`MODEL2_POS_Z: ${model2.Position.z}`, 0, 130);

        ctx.fillText(`MODEL2_ROT_X: ${model2.Rotation.x}`, 0, 150);
        ctx.fillText(`MODEL2_ROT_Y: ${model2.Rotation.y}`, 0, 160);
        ctx.fillText(`MODEL2_ROT_Z: ${model2.Rotation.z}`, 0, 170);

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