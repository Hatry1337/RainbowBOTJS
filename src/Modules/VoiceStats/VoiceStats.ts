import Discord from "discord.js";
import {
    Access,
    AccessTarget, Colors, EphemeralArrayConfigEntry,
    EphemeralConfigEntry, GuildOnlyError,
    Module,
    Synergy, SynergyUserError,
    User, Utils
} from "synergy3";
import { NeatTopBuilder } from "../../NeatTopBuilder";

interface VoiceStatsSession {
    channel: Discord.VoiceChannel;
    member: Discord.GuildMember;
    startedAt: Date;
}

type VoiceStatsEndedSession = VoiceStatsSession & {
    sessionLength: number;
}

interface VoiceStatsContainerChannels {
    [key: string]: {
        name: string;
        guildId: string;
        totalTimeSpent: number;
        timeSpentByUsers: {
            [key: string]: number;
        }
    }
}

interface VoiceStatsContainerGuilds {
    [key: string]: {
        name: string;
        totalTimeSpent: number;
    }
}

interface VoiceStatsContainerUsers {
    [key: string]: {
        name: string;
        totalTimeSpent: number;
    }
}

export default class VoiceStats extends Module {
    public Name: string = "VoiceStats";
    public Description: string = "Using this command you can view voice channels stats in this server.";
    public Category: string = "Utility";
    public Author: string = "Thomasss#9258";

    public Access: AccessTarget[] = [Access.PLAYER()];

    private activeSessions: Map<string, VoiceStatsSession> = new Map();
    private endedSessions: VoiceStatsEndedSession[] = [];

    private saveDataInterval?: NodeJS.Timeout;

    private configGuildListingEnable: EphemeralConfigEntry<"bool">;
    private configGuildHiddenChannels: EphemeralArrayConfigEntry<"channel">;

    private configUserListingEnable: EphemeralConfigEntry<"bool">;

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);
        this.SlashCommands.push(
            this.bot.interactions.createSlashCommand("vcstats", this.Access, this, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
                .build(builder => builder
                    .setDescription(this.Description)
                    .addSubcommandGroup(subcommandGroup => subcommandGroup
                        .setName("global")
                        .setDescription("View voice stats top")

                        .addSubcommand(subcommand => subcommand
                            .setName("users")
                            .setDescription("View voice stats users top")
                        )
                        .addSubcommand(subcommand => subcommand
                            .setName("guilds")
                            .setDescription("View voice stats guilds top")
                        )
                    )
                    .addSubcommandGroup(subcommandGroup => subcommandGroup
                        .setName("local")
                        .setDescription("View voice stats on this guild")

                        .addSubcommand(subcommand => subcommand
                            .setName("users")
                            .setDescription("View voice stats by users on this guild")
                        )
                        .addSubcommand(subcommand => subcommand
                            .setName("channels")
                            .setDescription("View voice stats by channels on this guild")
                        )
                        .addSubcommand(subcommand => subcommand
                            .setName("channel")
                            .setDescription("View voice stats in specific channel on this guild")
                            .addChannelOption(option => option
                                .setName("channel")
                                .setDescription("Channel to watch top on.")
                                .setRequired(true)
                                .addChannelTypes(Discord.ChannelType.GuildVoice)
                            )
                        )
                    )
                    .addSubcommand(subcommand => subcommand
                        .setName("my")
                        .setDescription("View your personal voice stats.")
                    )
                )
                .onExecute(this.Run.bind(this))
                .commit(),
        );

        this.configGuildListingEnable = this.bot.config.defaultConfigEntry("guild", this.Name, new EphemeralConfigEntry<"bool">(
            "vcs_guild_listing_enabled",
            "Enable listing of your Guild in global /vcstats top guilds command",
            "bool",
            false
        ));
        this.configGuildHiddenChannels = this.bot.config.defaultConfigEntry("guild", this.Name, new EphemeralArrayConfigEntry<"channel">(
            "vcs_hidden_channels",
            "Hide specified channels from Voice Stats tops.",
            "channel",
            false
        ));

        this.configUserListingEnable = this.bot.config.defaultConfigEntry("user", this.Name, new EphemeralConfigEntry<"bool">(
            "vcs_user_listing_enabled",
            "Enable listing of your profile in global /vcstats top users command",
            "bool",
            false
        ));
    }

    private async onRVoiceChannelJoin(channel: Discord.VoiceChannel, member: Discord.GuildMember) {
        let session = this.activeSessions.get(member.id);

        if (session) {
            this.endedSessions.push({
                ...session,
                sessionLength: Math.floor((new Date().getTime() - session.startedAt.getTime()) / 1000)
            });
            this.activeSessions.delete(member.id);
        }

        if (channel.id === channel.guild.afkChannelId || member.user.bot) {
            return;
        }

        this.activeSessions.set(member.id, {
            channel,
            member,
            startedAt: new Date()
        });
    }

    private async onRVoiceChannelQuit(channel: Discord.VoiceChannel, member: Discord.GuildMember) {
        let session = this.activeSessions.get(member.id);

        if (!session) return;

        this.endedSessions.push({
            ...session,
            sessionLength: Math.floor((new Date().getTime() - session.startedAt.getTime()) / 1000)
        });
        this.activeSessions.delete(member.id);
    }


    public async Init() {
        let fetched = 0;
        let channels = this.bot.client.channels.cache.filter(c => c instanceof Discord.VoiceChannel) as Discord.Collection<string, Discord.VoiceChannel>;
        for (let channel of channels.values()) {
            if (channel.id === channel.guild.afkChannelId) continue;

            for (let member of channel.members.values()) {
                if (member.user.bot) continue;

                this.activeSessions.set(member.id, {
                    channel,
                    member,
                    startedAt: new Date()
                });
                fetched++;
            }
        }

        this.Logger.Info(`[Init] Created ${fetched} sessions for users currently in channels.`);

        this.saveDataInterval = setInterval(this.saveData.bind(this), 5 * 60 * 1000);

        this.bot.events.addListener("VoiceChannelJoin", this.onRVoiceChannelJoin.bind(this));
        this.bot.events.addListener("VoiceChannelQuit", this.onRVoiceChannelQuit.bind(this));
    }

    public async UnLoad() {
        this.Logger.Info(`Unloading '${this.Name}' module:`);

        this.Logger.Info("Unsubscribing from 'VoiceChannelJoin' Event...")
        this.bot.events.removeListener("VoiceChannelJoin", this.onRVoiceChannelJoin);

        this.Logger.Info("Unsubscribing from 'VoiceChannelQuit' Event...")
        this.bot.events.removeListener("VoiceChannelQuit", this.onRVoiceChannelQuit);

        if (this.saveDataInterval) {
            clearInterval(this.saveDataInterval);
        }

        this.endedSessions = this.endedSessions.concat(
            Array.from(this.activeSessions.values()).map(s => ({
                ...s,
                sessionLength: Math.floor((new Date().getTime() - s.startedAt.getTime()) / 1000)
            }))
        );
        this.activeSessions.clear();
        await this.saveData();
    }

    private async saveData() {
        this.Logger.Info(`[SaveData] Saving data to storage...`);
        let created = 0;

        let container = await this.bot.modules.data.getContainer(this.UUID);
        let users = (container.get("users") ?? {}) as VoiceStatsContainerUsers;
        let guilds = (container.get("guilds") ?? {}) as VoiceStatsContainerGuilds;
        let channels = (container.get("channels") ?? {}) as VoiceStatsContainerChannels;

        for (let s of this.endedSessions) {
            let guild = guilds[s.channel.guild.id];
            if (!guild) {
                guilds[s.channel.guild.id] = {
                    name: s.channel.guild.name,
                    totalTimeSpent: s.sessionLength
                }
                guild = guilds[s.channel.guild.id];
            } else {
                guild.name = s.channel.guild.name;
                guild.totalTimeSpent += s.sessionLength;
            }

            let channel = channels[s.channel.id];
            if (!channel) {
                channels[s.channel.id] = {
                    name: s.channel.name,
                    guildId: s.channel.guild.id,
                    totalTimeSpent: s.sessionLength,
                    timeSpentByUsers: {}
                }
                channel = channels[s.channel.id];
            } else {
                channel.name = s.channel.name;
                channel.totalTimeSpent += s.sessionLength;
            }
            channel.timeSpentByUsers[s.member.id] = (channel.timeSpentByUsers[s.member.id] ?? 0) + s.sessionLength;

            let user = users[s.member.user.id];
            if (!user) {
                users[s.member.user.id] = {
                    name: s.member.user.tag,
                    totalTimeSpent: s.sessionLength
                }
                user = users[s.member.user.id];
                created++;
            } else {
                user.name = s.member.user.tag;
                user.totalTimeSpent += s.sessionLength;
            }
        }

        container.set("users", users);
        container.set("guilds", guilds);
        container.set("channels", channels);

        this.Logger.Info(`[SaveData] Created ${created}, updated ${this.endedSessions.length - created} entries.`);

        this.endedSessions = [];
    }

    public async Run(interaction: Discord.ChatInputCommandInteraction, user: User) {
        let subcommand = interaction.options.getSubcommand();
        let subcommandGroup = interaction.options.getSubcommandGroup();

        switch (subcommandGroup) {
            case "global": {
                switch (subcommand) {
                    case "users": {
                        return await this.handleGlobalUsers(interaction, user);
                    }
                    case "guilds": {
                        return await this.handleGlobalGuilds(interaction, user);
                    }
                }
                break;
            }
            case "local": {
                switch (subcommand) {
                    case "users": {
                        return await this.handleLocalUsers(interaction, user);
                    }
                    case "channels": {
                        return await this.handleLocalChannels(interaction, user);
                    }
                    case "channel": {
                        return await this.handleLocalChannel(interaction, user);
                    }
                }
                break;
            }
            case null: {
                switch (subcommand) {
                    case "my": {
                        return await this.handleMy(interaction, user);
                    }
                }
            }
        }
    }

    private async handleGlobalUsers(interaction: Discord.ChatInputCommandInteraction, user: User) {
        let container = await this.bot.modules.data.getContainer(this.UUID);
        let usersData = (container.get("users") ?? {}) as VoiceStatsContainerUsers;

        let filtered = Object.entries(usersData).filter(e => {
            let unifiedId = this.bot.users.unifiedIdFromDiscordId(e[0]);
            if (!unifiedId) return false;
            let value = this.configUserListingEnable.getValue(unifiedId);
            //By default listing is enabled for all users.
            if (value === undefined) return true;
            return value;
        });
        let sorted = filtered.sort((a, b) => b[1].totalTimeSpent - a[1].totalTimeSpent);

        let neatTopValues = sorted.map(u => ({
            member: this.bot.client.users.resolve(u[0]) ?? u[1].name,
            value: `${Utils.formatTime(u[1].totalTimeSpent)} in voice channels`
        }));

        let neatTop = new NeatTopBuilder()
            .setMembers(neatTopValues.slice(0, 10))
            .setEmbedOptions({
                title: `Global Users' Voice Stats`,
                color: Colors.Noraml
            });

        let selfIndex = sorted.findIndex(u => u[0] === interaction.user.id);
        if (selfIndex !== -1) {
            neatTop.setSelfMember({
                ...neatTopValues[selfIndex],
                place: selfIndex + 1
            });
        }

        await interaction.reply({embeds: [neatTop.toEmbed()]});
    }

    private async handleGlobalGuilds(interaction: Discord.ChatInputCommandInteraction, user: User) {
        let container = await this.bot.modules.data.getContainer(this.UUID);
        let guildsData = (container.get("guilds") ?? {}) as VoiceStatsContainerGuilds;

        let filtered = Object.entries(guildsData).filter(e => {
            let value = this.configUserListingEnable.getValue(e[0]);
            //By default listing is enabled for all guilds.
            if (value === undefined) return true;
            return value;
        });
        let sorted = filtered.sort((a, b) => b[1].totalTimeSpent - a[1].totalTimeSpent);

        let neatTopValues = sorted.map(u => ({
            member: u[1].name,
            value: `${Utils.formatTime(u[1].totalTimeSpent)} in voice channels`
        }));

        let neatTop = new NeatTopBuilder()
            .setMembers(neatTopValues.slice(0, 10))
            .setSelfLabelPattern("This guild is on %place% place. (%value%)")
            .setEmbedOptions({
                title: `Global Guilds' Voice Stats`,
                color: Colors.Noraml,
                footer: {
                    text: "this is hack",
                    iconURL: interaction.guild?.iconURL() ?? undefined
                }
            });

        let selfIndex = sorted.findIndex(u => u[0] === interaction.guildId);
        if (selfIndex !== -1) {
            neatTop.setSelfMember({
                ...neatTopValues[selfIndex],
                place: selfIndex + 1
            });
        }

        await interaction.reply({embeds: [neatTop.toEmbed()]});
    }

    private async handleLocalUsers(interaction: Discord.ChatInputCommandInteraction, user: User) {
        if (!interaction.inGuild() || !interaction.inCachedGuild()) {
            throw new GuildOnlyError();
        }

        let container = await this.bot.modules.data.getContainer(this.UUID);
        let channelsData = (container.get("channels") ?? {}) as VoiceStatsContainerChannels;
        let usersData = (container.get("users") ?? {}) as VoiceStatsContainerUsers;

        let guildChannels = Object.values(channelsData).filter(c => c.guildId === interaction.guildId);
        let userMap = new Map<string, number>();

        for (let gc of guildChannels) {
            for (let u of Object.entries(gc.timeSpentByUsers)) {
                let time = userMap.get(u[0]) ?? 0;
                userMap.set(u[0], time + u[1]);
            }
        }

        let filtered = Array.from(userMap).filter(e => {
            let unifiedId = this.bot.users.unifiedIdFromDiscordId(e[0]);
            if (!unifiedId) return false;
            let value = this.configUserListingEnable.getValue(unifiedId);
            //By default listing is enabled for all users.
            if (value === undefined) return true;
            return value;
        });

        let sorted = filtered.sort((a, b) => b[1] - a[1]);

        let neatTopValues = sorted.map(u => ({
            member: this.bot.client.users.resolve(u[0]) ?? usersData[u[0]].name,
            value: `${Utils.formatTime(u[1])} in voice channels`
        }));

        let neatTop = new NeatTopBuilder()
            .setMembers(neatTopValues.slice(0, 10))
            .setEmbedOptions({
                title: `Voice Stats in ${interaction.guild.name}`,
                color: Colors.Noraml
            });

        let selfIndex = sorted.findIndex(u => u[0] === interaction.user.id);
        if (selfIndex !== -1) {
            neatTop.setSelfMember({
                ...neatTopValues[selfIndex],
                place: selfIndex + 1
            });
        }

        await interaction.reply({embeds: [neatTop.toEmbed()]});
    }

    private async handleLocalChannels(interaction: Discord.ChatInputCommandInteraction, user: User) {
        if (!interaction.inGuild() || !interaction.inCachedGuild()) {
            throw new GuildOnlyError();
        }

        let container = await this.bot.modules.data.getContainer(this.UUID);
        let channelsData = (container.get("channels") ?? {}) as VoiceStatsContainerChannels;

        let guildChannels = Object.entries(channelsData).filter(c => c[1].guildId === interaction.guildId);

        let excludedChannels = this.configGuildHiddenChannels.getValues(interaction.guildId).map(c => c.id);
        let filtered = guildChannels.filter(e => !excludedChannels.includes(e[0]));

        let sorted = filtered.sort((a, b) => b[1].totalTimeSpent - a[1].totalTimeSpent);

        let neatTopValues = sorted.map(c => ({
            member: c[1].name,
            value: `${Utils.formatTime(c[1].totalTimeSpent)} in total by users`
        }));

        let neatTop = new NeatTopBuilder()
            .setMembers(neatTopValues.slice(0, 10))
            .setEmbedOptions({
                title: `Voice Stats in ${interaction.guild.name} - Channels`,
                color: Colors.Noraml
            });

        await interaction.reply({embeds: [neatTop.toEmbed()]});
    }

    private async handleLocalChannel(interaction: Discord.ChatInputCommandInteraction, user: User) {
        if (!interaction.inGuild() || !interaction.inCachedGuild()) {
            throw new GuildOnlyError();
        }

        let channel = interaction.options.getChannel("channel", true, [Discord.ChannelType.GuildVoice]);

        let container = await this.bot.modules.data.getContainer(this.UUID);
        let channelsData = (container.get("channels") ?? {}) as VoiceStatsContainerChannels;
        let usersData = (container.get("users") ?? {}) as VoiceStatsContainerUsers;

        let excludedChannels = this.configGuildHiddenChannels.getValues(interaction.guildId).map(c => c.id);
        let guildChannel = channelsData[channel.id];
        if (!guildChannel || guildChannel.guildId !== interaction.guildId || excludedChannels.includes(channel.id)) {
            throw new SynergyUserError("This channel does not exist, or data is not available yet.");
        }

        let users = Object.entries(guildChannel.timeSpentByUsers);
        let filtered = users.filter(e => {
            let unifiedId = this.bot.users.unifiedIdFromDiscordId(e[0]);
            if (!unifiedId) return false;
            let value = this.configUserListingEnable.getValue(unifiedId);
            //By default listing is enabled for all users.
            if (value === undefined) return true;
            return value;
        });

        let sorted = filtered.sort((a, b) => b[1] - a[1]);

        let neatTopValues = sorted.map(u => ({
            member: this.bot.client.users.resolve(u[0]) ?? usersData[u[0]].name,
            value: `${Utils.formatTime(u[1])} in voice channels`
        }));

        let neatTop = new NeatTopBuilder()
            .setMembers(neatTopValues.slice(0, 10))
            .setEmbedOptions({
                title: `Voice Stats in ${interaction.guild.name} - ${channel.name}`,
                color: Colors.Noraml
            });

        let selfIndex = sorted.findIndex(u => u[0] === interaction.user.id);
        if (selfIndex !== -1) {
            neatTop.setSelfMember({
                ...neatTopValues[selfIndex],
                place: selfIndex + 1
            });
        }

        await interaction.reply({embeds: [neatTop.toEmbed()]});
    }

    private async handleMy(interaction: Discord.ChatInputCommandInteraction, user: User) {
        let container = await this.bot.modules.data.getContainer(this.UUID);
        let channelsData = (container.get("channels") ?? {}) as VoiceStatsContainerChannels;
        let usersData = (container.get("users") ?? {}) as VoiceStatsContainerUsers;
        let guildsData = (container.get("guilds") ?? {}) as VoiceStatsContainerGuilds;

        let userData = usersData[interaction.user.id];
        if(!userData) {
            throw new SynergyUserError("We don't have any Voice Stats for you now. Hang out with your friends in voice channels and come back a bit later.");
        }

        let embed = new Discord.EmbedBuilder({
            title: "Your personal Voice Stats",
            description: `### ⌛ Time spent in all channels and guilds: ${Utils.formatTime(userData.totalTimeSpent)}`,
            color: Colors.Noraml
        });

        let guildsMap = new Map<string, number>();
        for(let c of Object.values(channelsData)) {
            let time = guildsMap.get(c.guildId) ?? 0;
            guildsMap.set(c.guildId, time + (c.timeSpentByUsers[interaction.user.id] ?? 0));
        }
        let guildsFiltered = Array.from(guildsMap).filter(e => {
            let value = this.configUserListingEnable.getValue(e[0]);
            //By default listing is enabled for all guilds.
            if (value === undefined) return true;
            return value;
        });
        let guildsSorted = guildsFiltered.sort((a, b) => b[1] - a[1]);
        let guildTopValues = guildsSorted.map(g => ({
            member: guildsData[g[0]].name,
            value: `${Utils.formatTime(g[1])} in total`
        }));

        let guildsTop = new NeatTopBuilder().setMembers(guildTopValues.slice(0, 10));
        embed.addFields({
            name: "Your top guilds",
            value: guildsTop.toString(false, false),
            inline: true,
        });

        if(interaction.inGuild()) {
            let guildChannels = Object.entries(channelsData).filter(c => c[1].guildId === interaction.guildId && c[1].timeSpentByUsers[interaction.user.id]);
            let channelsSorted = guildChannels.sort((a, b) => b[1].timeSpentByUsers[interaction.user.id] - a[1].timeSpentByUsers[interaction.user.id]);
            let channelsTopValues = channelsSorted.map(c => ({
                member: c[1].name,
                value: `${Utils.formatTime(c[1].timeSpentByUsers[interaction.user.id])}`
            }));
            let channelsTop = new NeatTopBuilder().setMembers(channelsTopValues.slice(0, 10));
            embed.addFields({
                name: "Your top channels on this Guild",
                value: channelsTop.toString(false, false),
                inline: true,
            });
        }

        await interaction.reply({embeds: [embed]});
    }
}