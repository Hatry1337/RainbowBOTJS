import { TileEntityRegistry } from "../Registrys/TileEntityRegistry";
import Discord from "discord.js";
import { Player } from "../inventory/Player";

export interface ITileEntityMeta{
    [key: string]: any
}
export interface ITEObject{
    code: string;
    meta: ITileEntityMeta;
}

export class TileEntity{
    public static REGISTRY: TileEntityRegistry = new TileEntityRegistry();

    public proto: typeof TileEntity = TileEntity;

    public update(): void{
    }

    public loadMeta(meta: ITileEntityMeta): void{
    }

    public saveMeta(): ITileEntityMeta{
        return {};
    }

    public async showInterface(player: Player, message: Discord.Message): Promise<Discord.Message>{
        return message.channel.send("`INTERFACE OF THIS MACHINE NOT IMPLEMENTED!`");
    }

    public async interact(player: Player, message: Discord.Message): Promise<Discord.Message>{
        return message.channel.send("`INTERRACTION WITH THIS MACHINE NOT IMPLEMENTED!`");
    }
}