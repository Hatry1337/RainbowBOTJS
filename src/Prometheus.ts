import client from "prom-client";
import http from "http";

const botRegistry = new client.Registry();

client.collectDefaultMetrics({ 
    prefix: process.env.PROM_PFX ?? "rainbowbot_", 
    register: botRegistry
});

let httpServer: http.Server | undefined;

const lazyParamsMap = new Map<string, client.Gauge>();

export default class Metrics {
    public static startHttpServer(port: number = 9258, host: string = "0.0.0.0") {
        if(httpServer) {
            throw new Error("Server is already running!");
        }

        httpServer = http.createServer(Metrics._onRequest);
        httpServer.listen(port, host);
    }

    public static stopHttpServer() {
        httpServer?.close();
        httpServer = undefined;
    }

    private static async _onRequest(req: http.IncomingMessage, res: http.ServerResponse) {
        if(req.url === "/metrics"){
            res.statusCode = 200;
            res.setHeader("Content-Type", botRegistry.contentType);
            res.write(await botRegistry.metrics());
            return res.end();
        }
        
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json; charset=utf-8;");
        res.write("{error: 1, status: 404, message: \"not found.\"}");
        return res.end();
    }

    public static createGauge(name: string, help: string, callback?: client.CollectFunction<client.Gauge>, pfx: boolean = true) {
        return new client.Gauge({
            name: pfx ? ((process.env.PROM_PFX ?? "rainbowbot_") + name) : name,
            help,
            collect: callback,
            registers: [ botRegistry ]
        });
    }

    public static setLazyParam(paramName: string, value: number, help?: string) {
        let gauge = lazyParamsMap.get(paramName);
        if(!gauge) {
            gauge = new client.Gauge({
                name: (process.env.PROM_PFX ?? "rainbowbot_") + paramName,
                help: help ?? "lazyParam",
                registers: [ botRegistry ]
            });
        }
        gauge.set(value);
    }
}
