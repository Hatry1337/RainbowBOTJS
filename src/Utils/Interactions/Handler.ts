import Discord from "discord.js";
import { Module, User } from "synergy3";
import { InteractionRouter } from "./Router";

export abstract class InteractionHandler<T extends Module> {
    //Set when defined in InteractionRouter
    public router!: InteractionRouter<T>;
    public module!: T;
    constructor() { }
    public abstract exec(interaction: Discord.ChatInputCommandInteraction, user: User): Promise<void>;
}