import { Access, AccessTarget, Colors, Module, Synergy, SynergyUserError, Utils } from "synergy3";
import Discord from "discord.js";
import LibraryWrapper, { LibraryItem, LibraryItemWithData } from "./LibraryWrapper";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { ModuleDataContainer } from "synergy3/dist/ModuleDataManager";

export interface ILibraryStats{
    mostLiked: LibraryItem;
    mostViewed: LibraryItem;
    totalViews: number;
    totalLikes: number;
    userLikes: number;
    userViews: number;
    picturesCount: number;
}

export default class Hentai extends Module{
    public Name:        string = "Hentai";
    public Description: string = "RainbowBOT's hentai library explorer.";
    public Category:    string = "NSFW";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.ADMIN(), Access.GROUP("Premium"), Access.GROUP("Voter") ]
    
    private library: LibraryWrapper;
    private storage!: ModuleDataContainer;

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);
        this.createSlashCommand(this.Name.toLowerCase(), undefined, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
        .build(builder => builder
            .setDescription(this.Description)
            .addSubcommand(sub => sub
                .setName("random")
                .setDescription("Random picture from library.")
                .addBooleanOption(opt => opt
                    .setName("ephemeral")
                    .setDescription("Send this picture with visiblity only for you.")
                    .setRequired(false)  
                )
                .addBooleanOption(opt => opt
                    .setName("fav")
                    .setDescription("Show pictures only from your favorites list.")
                    .setRequired(false)  
                )
            )
            .addSubcommand(sub => sub
                .setName("search")
                .setDescription("Search for picture by specified options.")
                .addIntegerOption(opt => opt
                    .setName("id")
                    .setDescription("Search for picture with this ID")
                    .setRequired(false)
                )
                .addBooleanOption(opt => opt
                    .setName("ephemeral")
                    .setDescription("Send this picture with visiblity only for you.")
                    .setRequired(false)  
                )
            )
            .addSubcommand(sub => sub
                .setName("stats")
                .setDescription("View stats about this command.")
                .addBooleanOption(opt => opt
                    .setName("ephemeral")
                    .setDescription("Send stats with visiblity only for you.")
                    .setRequired(false)  
                )
            )
            .addSubcommand(sub => sub
                .setName("favorites")
                .setDescription("Explore your liked pictures.")
                .addBooleanOption(opt => opt
                    .setName("ephemeral")
                    .setDescription("Send favorites with visiblity only for you.")
                    .setRequired(false)  
                )
            )
            .addSubcommand(sub => sub
                .setName("suggest")
                .setDescription("Suggest a picture to hentai lib.")
                .addStringOption(opt => opt
                    .setName("url")
                    .setDescription("Direct url to the picture.")    
                    .setRequired(true)
                )
                .addStringOption(opt => opt
                    .setName("message")
                    .setDescription("Message to library moderators.")    
                    .setRequired(false)
                )
            )
        )
        .onExecute(this.Run.bind(this))
        .commit()

        this.library = new LibraryWrapper(path.join("./", "runtime", "hentai"), async (data) => {
            await fs.mkdir(this.library.getPath(), { recursive: true });
            let datapath = path.join(this.library.getPath(), "data.json");
            await fs.writeFile(datapath, JSON.stringify(data, undefined, 4));
        });
    }

    public async Init(){
        this.storage = await this.bot.modules.data.getContainer(this.UUID);

        let datapath = path.join(this.library.getPath(), "data.json");
        try {
            let data = await fs.readFile(datapath);
            await this.library.load(JSON.parse(data.toString()));     
        } catch (error) {
            this.Logger.Warn("Error reading library data file: ", error);
            await fs.mkdir(this.library.getPath(), { recursive: true });
        }
        await this.library.loadNewPictures();
        await this.library.save();

        await this.bot.config.setIfNotExist("bot", "hentai_suggest_channel", undefined, "channel");
    }

    public async handleSearch(interaction: Discord.CommandInteraction){
        let picid = interaction.options.getInteger("id", false);
        let ephemeral = interaction.options.getBoolean("ephemeral", false) ?? false;

        if(!picid){
            throw new SynergyUserError("No search parameters specified.");
        }

        let pic = await this.library.getPictureData(picid);

        if(!pic){
            throw new SynergyUserError("Picture with this search parameters is not exist.");
        }

        let rand = crypto.pseudoRandomBytes(8).toString("hex");
        await this.countView(pic.id, interaction.user.id);

        let embeds = [this.makeEmbed(pic, rand)];
        let files = [{ attachment: pic.data, name: rand + `.${pic.format}` }];
        let components = [this.makeControls(pic, ephemeral ? "[E]" : "")];

        return await interaction.reply({ files, embeds, components, ephemeral });
    }

    private async countView(picId: number, userId: string){
        await this.library.countView(picId);
        let views = this.storage.get("user_views");
        if(views){
            if(views[userId]){
                views[userId]++;
            }else{
                views[userId] = 1;
            }
        }else{
            views = { [userId]: 1 };
        }
        this.storage.set("user_views", views);
    }

    public async handleStats(interaction: Discord.CommandInteraction){
        let ephemeral = interaction.options.getBoolean("ephemeral", false) ?? false;

        let stats = this.getStats(interaction.user.id);

        let emb = new Discord.MessageEmbed({
            title: "Hentai Library Stats",
            color: Colors.Noraml,
        });
        emb.addField("Most Liked", `\`#${stats.mostLiked.id}\` 📝, ${stats.mostLiked.likes} ❤️, ${stats.mostLiked.views} 👁`, true);
        emb.addField("Your Likes", `${stats.userLikes} ❤️`, true);
        emb.addField("Total Library Likes", `${stats.totalLikes} ❤️`, true);
        emb.addField("Most Viewed", `\`#${stats.mostViewed.id}\` 📝, ${stats.mostViewed.likes} ❤️, ${stats.mostViewed.views} 👁`, true);
        emb.addField("Your Views", `${stats.userViews} 👁`, true);
        emb.addField("Total Library Views", `${stats.totalViews} 👁`, true);
        emb.addField("Library Pictures Count", `${stats.picturesCount} 🖼️`, true);

        await interaction.reply({ embeds: [emb], ephemeral });
    }

    public getStats(userId: string): ILibraryStats {
        let pics = this.library.getPictures();
        let stats: ILibraryStats = {
            mostLiked:      pics.sort((a, b) => b.likes - a.likes)[0],
            mostViewed:     pics.sort((a, b) => b.views - a.views)[0],
            totalLikes:     pics.reduce((likes, item) => likes += item.likes, 0),
            totalViews:     pics.reduce((views, item) => views += item.views, 0),
            userLikes:      pics.filter(p => p.likesIds.includes(userId)).length,
            userViews:      (this.storage.get("user_views") ?? {})[userId] || 0,
            picturesCount:  pics.length
        }
        return stats;
    }

    public async handleSuggest(interaction: Discord.CommandInteraction){
        let url = interaction.options.getString("url", true);
        let msg = interaction.options.getString("message", false);

        let channel_id = await this.bot.config.get("bot", "hentai_suggest_channel") as string | undefined;
        if(!channel_id) throw new SynergyUserError("This feature is disabled at this moment.");
        let channel = await this.bot.client.channels.fetch(channel_id);
        if(!channel || !channel.isText()) throw new SynergyUserError("This feature is disabled at this moment.");

        let sug_emb = new Discord.MessageEmbed({
            title: `New suggestion from ${interaction.user.tag}`,
            description: msg ? `Message: ${msg}` : undefined,
            color: Colors.Noraml
        });
        sug_emb.setImage(url);

        /*
        let aprv_btn = this.createMessageButton([ Access.ADMIN(), Access.GROUP("hentmod") ], -1, 300000);
        aprv_btn.build(b => b
            .setLabel("Approve!")
            .setStyle("PRIMARY")    
        ).onExecute(this.handleApproveSugg.bind(this));

        let decl_btn = this.createMessageButton(`hsugg-decl-${}`, [ Access.ADMIN(), Access.GROUP("hentmod") ]);
        decl_btn.build(b => b
            .setLabel("Decline")
            .setStyle("DANGER")    
        ).onExecute(this.handleDeclineSugg.bind(this));

        let components = [new Discord.MessageActionRow().addComponents(aprv_btn.builder, decl_btn.builder)]
        */
        await channel.send({ embeds: [sug_emb] });

        let emb = new Discord.MessageEmbed({
            title: "Your suggestion sended to moderation. Thanks!",
            color: Colors.Noraml
        });
        await interaction.reply({ embeds: [emb], ephemeral: true });
    }

    /*
    public async handleApproveSugg(interaction: Discord.ButtonInteraction){

    }

    public async handleDeclineSugg(interaction: Discord.ButtonInteraction){

    }
    */

    public async handleFav(interaction: Discord.CommandInteraction){
        let ephemeral = interaction.options.getBoolean("ephemeral", false) ?? false;
        
        let favs = this.library.getPictures().filter(p => p.likesIds.includes(interaction.user.id));

        let emb = new Discord.MessageEmbed({
            title: "Your Favorite Pictures",
            color: Colors.Noraml,
            description: favs.length === 0  ? "You are not liked any pictures yet." 
                                            : favs.map(f => `\`#${f.id}\` 📝, ${f.likes} ❤️, ${f.views} 👁`).join("\n")
        });

        await interaction.reply({ embeds: [emb], ephemeral });
    }

    public async handleRandom(interaction: Discord.CommandInteraction | Discord.ButtonInteraction){
        let ephemeral: boolean;
        let fav: boolean;
        if(interaction.isCommand()){
            ephemeral = interaction.options.getBoolean("ephemeral", false) ?? false;
            fav = interaction.options.getBoolean("fav", false) ?? false;
        }else{
            ephemeral = interaction.component.label?.includes("[E]") ?? false;
            fav = interaction.component.label?.includes("[F]") ?? false;
        }

        let flags = "";
        if(ephemeral){
            flags += "[E]";
        }
        if(fav){
            flags += "[F]";
        }

        let pic: LibraryItemWithData;
        if(!fav){
            pic = await this.library.getRandomPictureData();
        }else{
            let favs = this.library.getPictures().filter(p => p.likesIds.includes(interaction.user.id));
            pic = await this.library.getPictureData(Utils.arrayRandElement(favs).id) as LibraryItemWithData;
        }
        let rand = crypto.pseudoRandomBytes(8).toString("hex");
        await this.countView(pic.id, interaction.user.id);

        let embeds = [this.makeEmbed(pic, rand)];
        let files = [{ attachment: pic.data, name: rand + `.${pic.format}` }];
        let components = [this.makeControls(pic, flags)];

        return await interaction.reply({ files, embeds, components, ephemeral });
    }

    public async handleLike(interaction: Discord.ButtonInteraction, picture: LibraryItem){
        let emb = new Discord.MessageEmbed({
            color: Colors.Noraml
        });
        if(picture.likesIds.includes(interaction.user.id)){
            emb.setTitle("You unliked this picture.");
            await this.library.unlike(picture.id, interaction.user.id);
        }else{
            emb.setTitle("You liked this picture.");
            await this.library.like(picture.id, interaction.user.id);
        }
        await interaction.reply({ embeds: [emb], ephemeral: true });
    }

    private makeControls(picture: LibraryItem, flags: string = ""){
        let btn_like = this.createMessageButton(this.Access, -1, 300000);
        btn_like.build(bld => bld
            .setLabel("Like")
            .setEmoji("❤️")
            .setStyle("PRIMARY")
        ).onExecute(async (interaction) => {
            await this.handleLike(interaction, picture);
        });
        
        let btn_more = this.createMessageButton(this.Access, -1, 300000);
        btn_more.build(bld => bld
            .setLabel("More!" + " " + flags)
            .setEmoji("🔥")
            .setStyle("PRIMARY")
        ).onExecute(this.handleRandom.bind(this));

        return new Discord.MessageActionRow().addComponents([btn_like.builder, btn_more.builder]);
    }

    private makeEmbed(picture: LibraryItemWithData, attachment: string){
        let emb = new Discord.MessageEmbed({
            title: `Hentai picture #${picture.id}`,
            color: Colors.Noraml
        });
        emb.setImage(`attachment://${attachment}.${picture.format}`);
        emb.setFooter({
            text: `${picture.views} views, ${picture.likes} likes`
        });
        return emb;
    }

    public async Run(interaction: Discord.CommandInteraction){
        if(!interaction.channel) throw new SynergyUserError("You can't use this command here.");

        let chnl = interaction.channel;
        let access = true;

        switch(chnl.type){
            case "GUILD_TEXT": {
                access = chnl.nsfw;
                break;
            }
            case "GUILD_PRIVATE_THREAD": {
                access = chnl.parent?.nsfw ?? false;
                break;
            }
            case "GUILD_PUBLIC_THREAD": {
                access = chnl.parent?.nsfw ?? false;
                break;
            }
            case "DM": {
                access = true;
                break;
            }
            default: {
                access = false;
            }
        }

        if(!access) throw new SynergyUserError("You can't use this command here.");

        let sub = interaction.options.getSubcommand();
        switch(sub) {
            case "search": {
                return await this.handleSearch(interaction);
            }
            case "stats": {
                return await this.handleStats(interaction);
            }
            case "suggest": {
                return await this.handleSuggest(interaction);
            }
            case "random": {
                return await this.handleRandom(interaction);
            }
            case "favorites": {
                return await this.handleFav(interaction);
            }
            default: {
                return await this.handleRandom(interaction);
            }
        }
    }
}