import { InteractionHandler } from "../../../Utils/Interactions/Handler";
import Discord from "discord.js";
import { SynergyUserError, User, Utils } from "synergy3";
import Battleship from "../Battleship";
import { Ship, ShipOrientation } from "../Game/Ship";
import { BattleshipPlayer } from "../Game/BattleshipPlayer";

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

        await interaction.deferReply();

        player.flushShips();
        let res = FieldRandomHandler.fillPlayerField(player, 450);

        this.module.Logger.Info(
            "[Battleship/FieldRandomHandler]",
            `Random field generation result: Iterations: ${res.iterations}, Fails: ${res.fails}, Time: ${res.time} ms.`
        );

        await interaction.editReply({ embeds: [ this.module.drawBoard(player) ] });
    }

    public static test(player: BattleshipPlayer, maxIterations: number, maxFails: number, repeats: number) {
        let result: {
            maxIters: number,
            maxFails: number,
            iters: number,
            fails: number,
            time: number,
            repeats: number,
        } = {
            maxIters: maxIterations,
            maxFails,
            iters: 0,
            fails: 0,
            time: 0,
            repeats
        };

        for (let i = 0; i < repeats; i++) {
            player.flushShips();
            let res = this.fillPlayerField(player, maxIterations, maxFails);
            result.iters += res.iterations;
            result.fails += res.fails;
            result.time += res.time;
        }

        result.iters /= result.repeats;
        result.fails /= result.repeats;
        result.time /= result.repeats;

        return result;
    }

    public static fillPlayerField(player: BattleshipPlayer, maxIterations: number = 450, maxFails: number = 1000) {
        let tsStart = new Date().getTime();
        let iterations = 0;
        let fails = 0;

        while (player.numAvailableShips() > 0) {
            let x = Utils.getRandomInt(0, player.field.width - 1);
            let y = Utils.getRandomInt(0, player.field.height - 1);
            let size = Utils.getRandomInt(1, 4);
            let orientation: ShipOrientation = Math.random() < 0.5 ? "vertical" : "horizontal";

            try {
                player.placeShip(new Ship(x, y, size, orientation));
            } catch (e) { }
            iterations++;
            if(iterations > maxIterations) {
                player.flushShips();
                iterations = 0;
                fails++;
            }
            if(fails > maxFails) {
                throw new SynergyUserError(`Unable to generate field after ${fails} fails.`);
            }
        }
        let tsEnd = new Date().getTime();

        return { iterations, fails, time: tsEnd - tsStart };
    }
}