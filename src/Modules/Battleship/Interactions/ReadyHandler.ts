import { InteractionHandler } from "../../../Utils/Interactions/Handler";
import Discord from "discord.js";
import { Colors, SynergyUserError, User } from "synergy3";
import Battleship from "../Battleship";

export class ReadyHandler extends InteractionHandler<Battleship> {
    public async exec(interaction: Discord.ChatInputCommandInteraction, user: User) {
        let game = this.module.games.get(interaction.user.id);

        if(!game) {
            throw new SynergyUserError("You don't have active battleship game.");
        }

        if(game.gameStage !== "prepare") {
            throw new SynergyUserError("You can't change your ready status on current game stage.");
        }

        let player = game.players.find(p => p.user.discordId === interaction.user.id);

        if(!player) {
            throw new Error("Player's game exist, but can't find player on it.");
        }

        let bSettings = this.module.getBoardSettings(interaction.user.id);

        if(player.ships.length < 10) {
            const drawShip = (size: number, max: number) => {
                return `**${player!.ships.filter(s => s.size === size).length}/${max}** - ${bSettings.shipSymbol.repeat(size)}`;
            }
            throw new SynergyUserError(
                "You don't placed all your ships yet.",
                "Your ships:\n\n" +
                `${drawShip(4, 1)}\n\n` +
                `${drawShip(3, 2)}\n\n` +
                `${drawShip(2, 3)}\n\n` +
                `${drawShip(1, 4)}`
            );
        }

        player.ready();

        await interaction.reply({ embeds: [ this.module.drawBoard(player) ] });
    }
}