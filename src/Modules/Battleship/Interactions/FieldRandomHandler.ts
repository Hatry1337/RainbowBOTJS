import { InteractionHandler } from "../../../Utils/Interactions/Handler";
import Discord from "discord.js";
import { SynergyUserError, User } from "synergy3";
import Battleship from "../Battleship";
import { Ship, ShipOrientation } from "../Game/Ship";
import BattleshipGame from "../Game/BattleshipGame";
import { PlayerPlaceShipError, PlayerPlaceShipErrorReason } from "../Game/Errors/PlayerPlaceShipError";

export class FieldRandomHandler extends InteractionHandler<Battleship> {
    public async exec(interaction: Discord.ChatInputCommandInteraction, user: User) {
        let game = this.module.games.get(interaction.user.id);

        if(!game) {
            throw new SynergyUserError("You don't have active battleship game.");
        }

        let player = game.players.find(p => p.user.discordId === interaction.user.id);

        if(!player) {
            throw new Error("Player's game exist, but can't find player on it.");
        }


        try {
            player.placeShip(new Ship(position.x - 1, position.y - 1, size, orientation));
        } catch (e) {
            if(e instanceof PlayerPlaceShipError) {
                switch (e.reason) {
                    case PlayerPlaceShipErrorReason.ShipOutOfBounds: {
                        throw new SynergyUserError(`This ship can't be placed here.`);
                    }
                    case PlayerPlaceShipErrorReason.WrongGameStage: {
                        throw new SynergyUserError(`You can't place ships in current game stage.`);
                    }
                    case PlayerPlaceShipErrorReason.OutOfShips: {
                        throw new SynergyUserError(`You can't place more ships of this type.`);
                    }
                }
            } else {
                throw e;
            }
        }

        await interaction.reply({ embeds: [ this.module.drawBoard(player) ] });
    }
}