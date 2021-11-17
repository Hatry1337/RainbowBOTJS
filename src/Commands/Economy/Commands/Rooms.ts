import Discord, { MessageEmbed } from "discord.js";
import ICommand from "../../ICommand";
import { Guild } from "../../../Models/Guild";
import { Emojis, Colors, Utils } from "../../../Utils";
import CommandsController from "../../../CommandsController";
import log4js from "log4js";
import { User } from "../../../Models/User";
import { Room } from "../Rooms/Room";
import Economy from "./Economy";
import { Player } from "../inventory/Player";
import { Items } from "../Items/Items";
import { Item } from "../Items/Item";
import { TileEntity } from "../TileEntitys/TileEntity";
import { ItemStack } from "../Items/ItemStack";
import { World } from "../World/World";


const logger = log4js.getLogger("command");

interface EnteredPlayer{
    Player: Player;
    Room: Room;
    Channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel;
}

class Rooms implements ICommand{
    Name:        string = "Rooms";
    Trigger:     string = "!rooms";
    Usage:       string = "`!rooms[ <sub_cmd>]`\n" +
                          "Sub Commands:\n" +
                          "`**NONE**` - Show your rooms.\n" +
                          "`create <name>` - Create new room with specified name.\n" +
                          "`delete <name>` - Delete room with specified name.\n" +
                          "`enter <name>` - Enter the room with specified name. When you entered, you can use direct commands and interact with mechanisms.\n" +
                          "`addmember <name> @user` - Add specified user to your room's members list.\n" +
                          "`removemember <name> @user` - Delete specified user from your room's members list.\n" +

                          "Examples:\n" +
                          "`!rooms`\n" + 
                          "`!rooms create MyCoolRoom`\n" +
                          "`!rooms delete MyCoolRoom`\n" +
                          "`!rooms enter MyCoolRoom`\n" +
                          "`!rooms addmember MyCoolRoom @MyBestFriend`\n" +
                          "`!rooms removemember MyCoolRoom @MyBestFriend`\n";

    Description: string = "Show your rooms with mechanisms.";
    Category:    string = "Economy";
    Author:      string = "Thomasss#9258";
    Controller: CommandsController

    EnteredPlayers: Map<string, EnteredPlayer> = new Map();

    constructor(controller: CommandsController) {
        this.Controller = controller;

        this.Controller.Client.on("message", async message => {
            let ep = this.EnteredPlayers.get(message.author.id);
            if(!ep) return;
            if(ep.Channel.id !== message.channel.id) return;

            let args = message.content.split(" ");

            switch(args[0]){
                case "quit":{
                    this.EnteredPlayers.delete(message.author.id);

                    let emb = new MessageEmbed({
                        title: `Successfully leaved from '${ep.Room.getName()}' room.`,
                        color: Colors.Noraml
                    });
                    return await message.channel.send(emb);
                }

                case "place":{
                    if(!args[1]){
                        return await Utils.ErrMsg("Item code not specified. (spaces not allowed)", message.channel);
                    }

                    let ireg = Item.REGISTRY.getItem(args[1]);
                    let item = ep.Player.getInventory().find(i => i.getItem() === ireg);

                    if(!item){
                        return await Utils.ErrMsg("You don't have this item.", message.channel);
                    }

                    let te = TileEntity.REGISTRY.getObjectByItem(item.getItem());

                    if(!te){
                        return await Utils.ErrMsg("You can't place this item.", message.channel);
                    }

                    item.shrink(1);
                    ep.Room.addMechs(new te());

                    let emb = new MessageEmbed({
                        title: `Successfully placed '${item.getItem().getName()}' to '${ep.Room.getName()}' room.`,
                        color: Colors.Noraml
                    });
                    return await message.channel.send(emb);
                }

                case "info":{
                    let txt = ""
                    let mechs = ep.Room.getMechs();
                    for(let i in mechs){
                        let j = parseInt(i);

                        let mech = TileEntity.REGISTRY.getItemByObject(mechs[j].proto)
                        if(!mech){
                            continue;
                        }
                        txt += `[${j}] ${mech.getName()} (${mech.getDescription()})\n`;
                    }
                    let emb = new MessageEmbed({
                        title: `Mechanisms of '${ep.Room.getName()}' room:`,
                        description: txt,
                        color: Colors.Noraml
                    });
                    return await message.channel.send(emb);
                }

                case "mech":{
                    if(!args[1]){
                        return await Utils.ErrMsg("Mechanism index not specified.", message.channel);
                    }

                    let mechs = ep.Room.getMechs();
                    let index = parseInt(args[1]);

                    if(isNaN(index) || index < 0 || index >= mechs.length){
                        return await Utils.ErrMsg("Incorrect mechanism index specified.", message.channel);
                    }

                    let mechanism = mechs[index];

                    if(!args[2]){
                        return await mechanism.showInterface(ep.Player, message);
                    }

                    return await mechanism.interact(ep.Player, message);
                }

                case "help":{
                    let emb = new MessageEmbed({
                        title: `Room Direct Commands:`,
                        description:    "`quit` - leave from current room.\n" +
                                        "`place <item_code>` - place specified item to the room.\n" +
                                        "`info` - info about this room.\n" +
                                        "`mech <index>[ <action> ...]` - interact with mechanism.\n",
                        color: Colors.Noraml
                    });
                    return await message.channel.send(emb);
                }
            }
        });
    }
    
    Test(mesage: Discord.Message){
        return mesage.content.toLowerCase().startsWith("!rooms");
    }
    
    Run(message: Discord.Message, guild: Guild, user: User){
        return new Promise<Discord.Message>(async (resolve, reject) => {
            let args = message.content.split(" ").slice(1);

            switch(args[0]){
                case "create":{
                    if(!args[1]){
                        return resolve(await Utils.ErrMsg("Room name not specified. (spaces not allowed)", message.channel));
                    }
                 
                    if(World.WORLD.getRoom(args[1])){
                        return resolve(await Utils.ErrMsg("This name already taken.", message.channel));
                    }

                    let rooms = World.WORLD.getOwnedRooms(user.ID);
                    if(rooms.length >= 5){
                        return resolve(await Utils.ErrMsg("You reached rooms limit (5).", message.channel));
                    }

                    let player = World.WORLD.getPlayer(user.ID);

                    if(!player){
                        player = await Player.createOrLoadFromStorage(user.ID);
                        World.WORLD.setPlayer(user.ID, player);
                    }

                    World.WORLD.setRoom(args[1], new Room(args[1], player));

                    let emb = new MessageEmbed({
                        title: `Successfully created room '${args[1]}'.`,
                        color: Colors.Noraml
                    });
                    return resolve(await message.channel.send(emb));
                }

                case "delete":{
                    if(!args[1]){
                        return resolve(await Utils.ErrMsg("Room name not specified. (spaces not allowed)", message.channel));
                    }

                    let ri = World.WORLD.getRoom(args[1]);

                    if(!ri || ri.getOwner().getUser().ID !== user.ID){
                        return resolve(await Utils.ErrMsg("Room with this name not exist.", message.channel));
                    }
                    
                    World.WORLD.delRoom(ri.getName());

                    let emb = new MessageEmbed({
                        title: `Successfully deleted room '${args[1]}'.`,
                        color: Colors.Noraml
                    });
                    return resolve(await message.channel.send(emb));
                }

                case "enter":{
                    if(!args[1]){
                        return resolve(await Utils.ErrMsg("Room name not specified. (spaces not allowed)", message.channel));
                    }

                    let room = World.WORLD.getPlayerRooms(user.ID).find(r => r.getName() === args[1]);

                    if(!room){
                        return resolve(await Utils.ErrMsg("Room with this name not exist.", message.channel));
                    }
                    
                    let player = World.WORLD.getPlayer(user.ID);

                    if(!player){
                        player = await Player.createOrLoadFromStorage(user.ID);
                        World.WORLD.setPlayer(user.ID, player);
                    }

                    this.EnteredPlayers.set(user.ID, {
                        Player: player,
                        Room: room,
                        Channel: message.channel
                    });

                    let emb = new MessageEmbed({
                        title: `You entered into '${room.getName()}' room. Now you can use direct commands here. Using \`help\` you can view list of direct commands. Use \`quit\` to leave room and direct commands mode.`,
                        color: Colors.Noraml
                    });
                    return resolve(await message.channel.send(emb));
                }

                case "addmember":{
                    if(!args[1]){
                        return resolve(await Utils.ErrMsg("Room name not specified. (spaces not allowed)", message.channel));
                    }

                    if(!args[2]){
                        return resolve(await Utils.ErrMsg("Member ID is not specified.", message.channel));
                    }

                    let room = World.WORLD.getPlayerRooms(user.ID).find(r => r.getName() === args[1]);

                    if(!room){
                        return resolve(await Utils.ErrMsg("Room with this name not exist.", message.channel));
                    }
                    
                    let player = World.WORLD.getPlayer(user.ID);
                    
                    let memid = Utils.parseID(args[2]);
                    let member = World.WORLD.getPlayer(memid);

                    if(!player){
                        player = await Player.createOrLoadFromStorage(user.ID)!;
                        World.WORLD.setPlayer(user.ID, player);
                    }

                    if(!member){
                        member = await Player.createOrLoadFromStorageSafe(memid);
                        if(!member){
                            return resolve(await Utils.ErrMsg("This user is not registered.", message.channel));
                        }
                        World.WORLD.setPlayer(memid, member);
                    }

                    if(room.getOwner().getUser().ID !== message.author.id){
                        return resolve(await Utils.ErrMsg("You are not Owner of this room.", message.channel));
                    }

                    room.addMember(member);

                    let emb = new MessageEmbed({
                        title: `Successfully added '${member.getUser().Tag}' to '${room.getName()}' room members list.`,
                        color: Colors.Noraml
                    });
                    return resolve(await message.channel.send(emb));
                }

                case "removemember":{
                    if(!args[1]){
                        return resolve(await Utils.ErrMsg("Room name not specified. (spaces not allowed)", message.channel));
                    }

                    if(!args[2]){
                        return resolve(await Utils.ErrMsg("Member ID is not specified.", message.channel));
                    }

                    let room = World.WORLD.getPlayerRooms(user.ID).find(r => r.getName() === args[1]);

                    if(!room){
                        return resolve(await Utils.ErrMsg("Room with this name not exist.", message.channel));
                    }
                    
                    let player = World.WORLD.getPlayer(user.ID);
                    
                    let memid = Utils.parseID(args[2]);
                    let member = World.WORLD.getPlayer(memid);

                    if(!player){
                        player = await Player.createOrLoadFromStorage(user.ID)!;
                        World.WORLD.setPlayer(user.ID, player);
                    }

                    if(!member){
                        member = await Player.createOrLoadFromStorageSafe(memid);
                        if(!member){
                            return resolve(await Utils.ErrMsg("This user is not registered.", message.channel));
                        }
                        World.WORLD.setPlayer(memid, member);
                    }

                    if(room.getOwner().getUser().ID !== message.author.id){
                        return resolve(await Utils.ErrMsg("You are not Owner of this room.", message.channel));
                    }

                    if(!room.hasMember(member)){
                        return resolve(await Utils.ErrMsg("This user doesen't exist in this room.", message.channel));
                    }

                    room.rmMember(member);

                    let emb = new MessageEmbed({
                        title: `Successfully removed '${member.getUser().Tag}' from '${room.getName()}' room members list.`,
                        color: Colors.Noraml
                    });
                    return resolve(await message.channel.send(emb));
                }

                default:{
                    let rooms = World.WORLD.getPlayerRooms(user.ID);
                    if(!rooms || rooms.length === 0){
                        return resolve(await Utils.ErrMsg("You don't have any rooms.", message.channel));
                    }
                    
                    let txt = ""
                    for(let room of rooms){
                        let isOwner = room.getOwner().getUser().ID === user.ID;
                        txt += (isOwner ? "**" : " ") + `${room.getName()}, Owner: <@${room.getOwner().getUser().ID}>, Mechs: ${room.getMechs().length}` + (isOwner ? "**" : " ") + "\n";
                    }
                    let emb = new MessageEmbed({
                        title: `${message.author.tag}'s Rooms:`,
                        description: txt,
                        color: Colors.Noraml
                    });
                    return resolve(await message.channel.send(emb));
                }
            }
        });
    }
}

export = Rooms;