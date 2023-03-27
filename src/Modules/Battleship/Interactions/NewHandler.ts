import { InteractionHandler } from "../../../Utils/Interactions/Handler";
import Discord from "discord.js";
import { Colors, SynergyUserError, User } from "synergy3";
import Battleship from "../Battleship";
import BattleshipGame from "../Game/BattleshipGame";

export class NewHandler extends InteractionHandler<Battleship> {
    public async exec(interaction: Discord.ChatInputCommandInteraction, user: User) {
        let player2 = interaction.options.getUser("player2", true);
        let game = this.module.games.get(interaction.user.id) || this.module.games.get(player2.id);

        if(game) {
            throw new SynergyUserError("You or second player already have active battleship game.");
        }

        let user2 = await this.module.bot.users.get(player2.id);

        if(!user2) {
            throw new SynergyUserError("Failed to fetch player2 user object. Please try again.");
        }

        game = new BattleshipGame();
        game.addPlayer(user);
        game.addPlayer(user2);

        this.module.games.set(user.discordId, game);
        this.module.games.set(user2.discordId, game);

        let embed = new Discord.EmbedBuilder({
            title: "Battleship",
            description:    `You successfully created new Battleship game with ${player2}.\n` +
                            "Place ships on your battle field with `/battleship field place` command.",
            color: Colors.Noraml
        });

        await interaction.reply({ embeds: [ embed ] });
    }
}