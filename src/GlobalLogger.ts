import log4js, { Logger } from "log4js";
import { Utils } from "./Utils";
import crypto from "crypto";
import treeify from "treeify"

export class GlobalLogger{
    static {
        log4js.configure({
            appenders: {
                console:  { type: 'console' },
                file:     { type: 'file', filename: 'botlog.log' },
                database: { type: 'file', filename: 'sql.log' },
                userlog:  { type: 'file', filename: 'userlog.log' },
                trace:    { type: 'file', filename: 'trace.log' }
            },
            categories: {
                default:  { appenders: ['console', 'file'], level: 'info' },
                root:     { appenders: ['console', 'file'], level: 'info' },
                command:  { appenders: ['console', 'file'], level: 'info' },
                economy:  { appenders: ['console', 'file'], level: 'info' },
                database: { appenders: ['database'],        level: 'info' },
                userlog:  { appenders: ['userlog'],         level: 'info' },
                trace:    { appenders: ['trace'],           level: 'info' }
            }
        });
    }
    public static root     = log4js.getLogger("root");
    public static command  = log4js.getLogger("command");
    public static economy  = log4js.getLogger("economy");
    public static database = log4js.getLogger("database");
    public static userlog  = log4js.getLogger("userlog");
    private static trace   = log4js.getLogger("trace");

    public static Trace(...args: any[]): string{
        let traceid = `${new Date().getTime()}-${crypto.randomBytes(32).toString('hex')}`;
        let out =`${traceid}\n`;
        for(let a of args){
            out += `${a?.constructor?.name || "Object"}\n${treeify.asTree(a, true, true)}\n`;
        }
        this.trace.info(out);
        return traceid;
    }
}