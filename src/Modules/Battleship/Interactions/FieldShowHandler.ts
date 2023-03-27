import { InteractionHandler } from "../../../Utils/Interactions/Handler";
import Discord from "discord.js";
import { Colors, SynergyUserError, User } from "synergy3";
import Battleship from "../Battleship";

export class FieldShowHandler extends InteractionHandler<Battleship> {
    public async exec(interaction: Discord.ChatInputCommandInteraction, user: User) {
        let game = this.module.games.get(interaction.user.id);

        if(!game) {
            throw new SynergyUserError("You don't have active battleship game.");
        }

        let player = game.players.find(p => p.user.discordId === interaction.user.id);

        if(!player) {
            throw new Error("Player's game exist, but can't find player on it.");
        }

        await interaction.reply({ embeds: [ this.module.drawBoard(player) ] });
    }
}