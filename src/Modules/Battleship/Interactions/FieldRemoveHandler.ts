import { InteractionHandler } from "../../../Utils/Interactions/Handler";
import Discord from "discord.js";
import { SynergyUserError, User } from "synergy3";
import Battleship from "../Battleship";
import { Ship, ShipOrientation } from "../Game/Ship";
import BattleshipGame from "../Game/BattleshipGame";
import { PlayerPlaceShipError, PlayerPlaceShipErrorReason } from "../Game/Errors/PlayerPlaceShipError";
import { PlayerRemoveShipError, PlayerRemoveShipErrorReason } from "../Game/Errors/PlayerRemoveShipError";

export class FieldRemoveHandler extends InteractionHandler<Battleship> {
    public async exec(interaction: Discord.ChatInputCommandInteraction, user: User) {
        let game = this.module.games.get(interaction.user.id);

        if(!game) {
            throw new SynergyUserError("You don't have active battleship game.");
        }

        let player = game.players.find(p => p.user.discordId === interaction.user.id);

        if(!player) {
            throw new Error("Player's game exist, but can't find player on it.");
        }

        let position = BattleshipGame.parseLiteralCords(interaction.options.getString("position", true));

        if(!position) {
            throw new SynergyUserError("Incorrect ship position typed.");
        }

        try {
            player.removeShip(position.x - 1, position.y - 1);
        } catch (e) {
            if(e instanceof PlayerRemoveShipError) {
                switch (e.reason) {
                    case PlayerRemoveShipErrorReason.WrongGameStage: {
                        throw new SynergyUserError(`You can't place ships in current game stage.`);
                    }
                    case PlayerRemoveShipErrorReason.CellIsNotShip: {
                        throw new SynergyUserError(`There are no ships on specified position.`);
                    }
                }
            } else {
                throw e;
            }
        }

        await interaction.reply({ embeds: [ this.module.drawBoard(player) ] });
    }
}