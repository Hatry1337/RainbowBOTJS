import { Access, AccessTarget, Colors, Module, Synergy } from "synergy3";
import Discord from "discord.js";
import got from "got";

interface ICatAPIBreed{
    id: string;
    name: string;
    description: string;
    weight: { imperial: string, metric: string };
    cfa_url: string;
    vetstreet_url: string;
    vcahospitals_url: string;
    wikipedia_url: string;
    temperament: string;
    origin: string;
    country_codes: string;
    country_code: string;
    life_span: string;
    alt_names: string;
    adaptability: number;
    affection_level: number;
    child_friendly: number;
    dog_friendly: number;
    energy_level: number;
    grooming: number;
    health_issues: number;
    intelligence: number;
    shedding_level: number;
    social_needs: number;
    stranger_friendly: number;
    vocalisation: number;
    reference_image_id: string;
    experimental: 0 | 1;
    hairless: 0 | 1;
    natural: 0 | 1;
    rare: 0 | 1;
    rex: 0 | 1;
    suppressed_tail: 0 | 1;
    short_legs: 0 | 1;
    hypoallergenic: 0 | 1;
    indoor: 0 | 1;
    lap: 0 | 1;
}

interface ICatAPICategory{
    id: number;
    name: string;
}

interface ICatAPICat{
    breeds: ICatAPIBreed[];
    categories?: ICatAPICategory[];
    id: string;
    url: string;
    width: number;
    height: number;
}

export default class RandCat extends Module{
    public Name:        string = "RandCat";
    public Description: string = "Using this command you can watch random cats pictures.";
    public Category:    string = "Fun";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.PLAYER() ]

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);
        this.createSlashCommand(this.Name.toLowerCase(), undefined, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
        .build(builder => builder
            .setDescription(this.Description)
        )
        .onExecute(this.Run.bind(this))
        .commit()
    }

    public async Run(interaction: Discord.CommandInteraction){
        await interaction.deferReply();

        let cat = JSON.parse((await got("https://api.thecatapi.com/v1/images/search?size=full")).body)[0] as ICatAPICat;
        let breed = cat.breeds[0];
        
        let embed = new Discord.MessageEmbed({
            title: "Random Cat",
            image: { url: cat.url },
            footer: { text: `Provided by thecatapi.com` },
            color: Colors.Noraml
        });

        if(breed){
            embed.addField("Breed", breed.name);
            embed.addField("Country", `${breed.origin} :flag_${breed.country_code.toLowerCase()}:`);
            embed.addField("Description", breed.description);
            embed.addField("Temperament", breed.temperament);
            let links = "";
            links += breed.cfa_url          ? `[CFA](${breed.cfa_url})\n` : "";
            links += breed.vetstreet_url    ? `[VetStreet](${breed.vetstreet_url})\n` : "";
            links += breed.vcahospitals_url ? `[VCA](${breed.vcahospitals_url})\n` : "";
            links += breed.wikipedia_url    ? `[Wikipedia](${breed.wikipedia_url})` : "";

            if(links !== ""){
                embed.addField("Links", links);
            }
        }

        await interaction.editReply({ embeds: [embed] });
    }
}