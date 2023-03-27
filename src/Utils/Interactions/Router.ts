import { InteractionHandler } from "./Handler";
import Discord from "discord.js";
import { Module, User } from "synergy3";

export class InteractionRouter<T extends Module> {
    public handlers: Map<`${string}/${string}`, InteractionHandler<T>> = new Map();
    constructor(public module: T) { }

    public defineHandler(handler: InteractionHandler<T>, command: string = "root", group: string = "root") {
        handler.router = this;
        handler.module = this.module;
        this.handlers.set(`${group}/${command}`, handler);
        return this;
    }

    public removeHandler(command: string, group: string = "root") {
        this.handlers.delete(`${group}/${command}`);
        return this;
    }

    public async route(interaction: Discord.ChatInputCommandInteraction, user: User) {
        let group = interaction.options.getSubcommandGroup() || "root";
        let command = interaction.options.getSubcommand() || "root";

        let handler = this.handlers.get(`${group}/${command}`);
        if(!handler) {
            throw new Error(`Missing interaction handler for "${group}/${command}" command.`);
        }

        await handler.exec(interaction, user);
        return;
    }
}