import { Access, Module, RainbowBOT } from "rainbowbot-core";

export default class NeuralFrog extends Module{
    public Name:        string = "NeuralFrog";
    public Description: string = "NeuralFrog Module.";
    public Category:    string = "Fun";
    public Author:      string = "Thomasss#9258";

    public Access: string[] = [ Access.PLAYER() ]

    constructor(bot: RainbowBOT, UUID: string, parent: Module) {
        super(bot, UUID, parent);
        this.SlashCommands.push();
    }
}