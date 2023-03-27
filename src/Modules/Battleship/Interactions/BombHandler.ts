import { InteractionHandler } from "../../../Utils/Interactions/Handler";
import Discord from "discord.js";
import { SynergyUserError, User } from "synergy3";
import Battleship from "../Battleship";
import BattleshipGame from "../Game/BattleshipGame";
import { PlayerBombEnemyError, PlayerBombEnemyErrorReason } from "../Game/Errors/PlayerBombEnemyError";

export class BombHandler extends InteractionHandler<Battleship> {
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
            throw new SynergyUserError("Incorrect cell position typed.");
        }

        let enemyIndex = game.players.findIndex(p => p.user.discordId !== interaction.user.id);
        if(enemyIndex === -1) {
            throw new Error("Can't find enemy index in players list.");
        }

        try {
            player.bombEnemy(enemyIndex, position.x - 1, position.y - 1);
        } catch (e) {
            if(e instanceof PlayerBombEnemyError) {
                switch (e.reason) {
                    case PlayerBombEnemyErrorReason.PlayerIndexOutOfRange: {
                        throw new Error("Enemy index out of range.");
                    }
                    case PlayerBombEnemyErrorReason.WrongGameStage: {
                        throw new SynergyUserError(`You can't bomb cells in current game stage.`);
                    }
                    case PlayerBombEnemyErrorReason.CellAlreadyBombed: {
                        throw new SynergyUserError(`This cell is already bombed.`);
                    }
                    case PlayerBombEnemyErrorReason.PositionOutOfBounds: {
                        throw new SynergyUserError(`Incorrect cell position.`);
                    }
                    case PlayerBombEnemyErrorReason.WrongGameMove: {
                        throw new SynergyUserError(`It is not your turn now.`);
                    }
                }
            } else {
                throw e;
            }
        }

        await interaction.reply({ embeds: [ this.module.drawBoard(player) ] });
    }
}