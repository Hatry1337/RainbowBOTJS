import { Access, AccessTarget, Colors, Module, Synergy, SynergyUserError, User } from "synergy3";
import Discord from "discord.js";

interface ITempGroupInfo{
    user: User;
    group: string;
    time: number;
    addedAt: Date;
    expireAt: Date;
}

interface ITempGroupInfoJSON{
    user: number;
    userDiscordId: string;
    group: string;
    time: number;
    addedAt: number;
    expireAt: number;
}

export interface GrpMgrSharedMethods{
    addTempGroup: (group: string, user: User, time_s: number) => Promise<void>;
    delTempGroup: (group: string, user: User) => Promise<void>;
}

export default class GrpMgr extends Module{
    public Name:        string = "GrpMgr";
    public Description: string = "Manage users' groups.";
    public Category:    string = "BOT";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.ADMIN() ]

    private checkTimer?: NodeJS.Timeout;
    public tempGroups: Map<string, ITempGroupInfo[]> = new Map();;

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);
        this.createSlashCommand(this.Name.toLowerCase(), undefined, this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
        .build(builder => builder
            .setDescription(this.Description)
            .addSubcommand(sub => sub
                .setName("add")
                .setDescription("Add new group to user.")
                .addStringOption(opt => opt
                    .setName("group")
                    .setDescription("Name of group to add to user.")
                    .setRequired(true)
                )
                .addUserOption(opt => opt
                    .setName("user")
                    .setDescription("User to add group to.")
                    .setRequired(true)
                )
            )
            .addSubcommand(sub => sub
                .setName("del")
                .setDescription("Add new group to user.")
                .addStringOption(opt => opt
                    .setName("group")
                    .setDescription("Name of group to add to user.")
                    .setRequired(true)
                )
                .addUserOption(opt => opt
                    .setName("user")
                    .setDescription("User to add group to.")
                    .setRequired(true)
                )
            )
            .addSubcommand(sub => sub
                .setName("addtemp")
                .setDescription("Add new temporary group to user.")
                .addStringOption(opt => opt
                    .setName("group")
                    .setDescription("Name of group to add to user.")
                    .setRequired(true)
                )
                .addUserOption(opt => opt
                    .setName("user")
                    .setDescription("User to add group to.")
                    .setRequired(true)
                )
                .addIntegerOption(opt => opt
                    .setName("time")
                    .setDescription("After this time role will be deleted. (Seconds)")
                    .setRequired(true)    
                )
            )
        )
        .onSubcommand("add", this.handleAdd.bind(this))
        .onSubcommand("addtemp", this.handleAddTemp.bind(this))
        .onSubcommand("del", this.handleDel.bind(this))
        .commit()

        this.createSlashCommand("groups", [ Access.PLAYER() ], this.bot.moduleGlobalLoading ? undefined : this.bot.masterGuildId)
        .build(builder => builder
            .setDescription("View your groups and expiration time.")
        )
        .onExecute(this.handleListGroups.bind(this))
        .commit()

        this.setSharedMethods({
            addTempGroup: this.addTempGroup.bind(this),
            delTempGroup: this.delTempGroup.bind(this)
        });
    }

    public async Init(){
        await this.loadTempGroupsInfo();
        this.checkTimer = setInterval(this.checkGroups.bind(this), 300000);
    }

    public async UnLoad(){
        await this.saveTempGroupsInfo();
        if(this.checkTimer){
            clearInterval(this.checkTimer);
        }
    }

    private async checkGroups(){
        for(let userinfo of this.tempGroups){
            for(let grp in userinfo[1]){
                let grpinfo = userinfo[1][grp];

                //check if temp group expired
                if(new Date().getTime() > grpinfo.expireAt.getTime()){
                    let indx = grpinfo.user.groups.indexOf(grpinfo.group);
                    if(indx !== -1){
                        //remove group from user if exists
                        grpinfo.user.groups.splice(indx, 1);
                    }
                    //remove temp group info from user's infos array
                    userinfo[1].splice(parseInt(grp), 1);
                }
            }
        }
        await this.saveTempGroupsInfo();
    }

    private async saveTempGroupsInfo(){
        let cont = await this.bot.modules.data.getContainer(this.UUID);
        let tgrps = (cont.get("temp_groups") || {}) as { [key: string]: ITempGroupInfoJSON[] }; 

        for(let e of this.tempGroups){
            tgrps[e[0]] = [];
            for(let g of e[1]){
                tgrps[e[0]].push({
                    user: g.user.id,
                    userDiscordId: g.user.discordId,
                    group: g.group,
                    time: g.time,
                    addedAt: Math.floor(g.addedAt.getTime() / 1000),
                    expireAt: Math.floor(g.expireAt.getTime() / 1000),
                });
            }
        }
        cont.set("temp_groups", tgrps);
    }

    private async loadTempGroupsInfo(){
        let cont = await this.bot.modules.data.getContainer(this.UUID);
        let tgrps = (cont.get("temp_groups") || {}) as { [key: string]: ITempGroupInfoJSON[] }; 

        for(let k of Object.keys(tgrps)){
            let data: ITempGroupInfo[] = [];
            for(let g of tgrps[k]){
                data.push({
                    user: await this.bot.users.get(g.userDiscordId) ?? undefined!,
                    group: g.group,
                    time: g.time,
                    addedAt: new Date(g.addedAt * 1000),
                    expireAt: new Date(g.expireAt * 1000)
                });
            }
            this.tempGroups.set(k, data);
        }
    }

    public async addTempGroup(group: string, user: User, time_s: number){
        let uinfo = this.tempGroups.get(user.discord.id) || [];
        uinfo.push({
            user,
            group,
            time: time_s,
            addedAt: new Date(),
            expireAt: new Date(new Date().getTime() + (time_s * 1000))
        });
        this.tempGroups.set(user.discord.id, uinfo);

        if(!user.groups.includes(group)){
            user.groups.push(group);
        }
        await this.saveTempGroupsInfo();
    }

    public async delTempGroup(group: string, user: User){
        let uinfo = this.tempGroups.get(user.discord.id) || [];
        for(let i in uinfo){
            if(uinfo[i].group === group){
                uinfo.splice(parseInt(i), 1);
            }
        }
        this.tempGroups.set(user.discord.id, uinfo);

        await this.saveTempGroupsInfo();
    }

    public async handleAdd(interaction: Discord.CommandInteraction){
        let duser = interaction.options.getUser("user", true);
        let group = interaction.options.getString("group", true);

        if(group === "admin") throw new SynergyUserError("You can't add admin group to user.");

        let user = await this.bot.users.get(duser.id);
        if(!user) throw new SynergyUserError("This user is not registered.");

        let indx = user.groups.indexOf(group);
        if(indx !== -1) throw new SynergyUserError(`This user already have group "${group}"`);

        user.groups.push(group);
        
        let emb = new Discord.MessageEmbed({
            title: `Successfully added group "${group}" to user ${duser.tag}`,
            color: Colors.Noraml
        });
        return await interaction.reply({ embeds: [emb] });
    }

    public async handleAddTemp(interaction: Discord.CommandInteraction){
        let duser = interaction.options.getUser("user", true);
        let group = interaction.options.getString("group", true);
        let time = interaction.options.getInteger("time", true);

        if(group === "admin") throw new SynergyUserError("You can't add admin group to user.");

        let user = await this.bot.users.get(duser.id);
        if(!user) throw new SynergyUserError("This user is not registered.");

        let indx = user.groups.indexOf(group);
        if(indx !== -1) throw new SynergyUserError(`This user already have group "${group}"`);

        await this.addTempGroup(group, user, time);
        
        let emb = new Discord.MessageEmbed({
            title: `Successfully added group "${group}" to user ${duser.tag}`,
            description: `Expiration at: <t:${Math.floor((new Date().getTime() / 1000) + time)}>`,
            color: Colors.Noraml
        });
        return await interaction.reply({ embeds: [emb] });
    }

    public async handleDel(interaction: Discord.CommandInteraction){
        let duser = interaction.options.getUser("user", true);
        let group = interaction.options.getString("group", true);

        if(group === "admin") throw new SynergyUserError("You can't remove admin group from user.");

        let u_id = this.bot.users.idFromDiscordId(duser.id);
        if(!u_id) throw new SynergyUserError("This user is not registered.");

        let user = await this.bot.users.get(duser.id);
        if(!user) throw new SynergyUserError("This user is not registered.");

        let indx = user.groups.indexOf(group);
        if(indx === -1) throw new SynergyUserError(`This user don't have group "${group}"`);
        
        user.groups.splice(indx, 1);

        let emb = new Discord.MessageEmbed({
            title: `Successfully removed group "${group}" from user ${duser.tag}`,
            color: Colors.Noraml
        });
        return await interaction.reply({ embeds: [emb] });
    }

    public async handleListGroups(interaction: Discord.CommandInteraction, user: User){
        let emb = new Discord.MessageEmbed({
            title: "List of your Groups",
            color: Colors.Noraml
        });

        let text = "";
        let tmp_grps = this.tempGroups.get(user.discord.id);

        for(let g of user.groups){
            let tg = tmp_grps?.find(t => t.group === g);
            text += g + " - " + (tg ? `Expires at: <t:${Math.floor(tg.expireAt.getTime() / 1000)}>` : "`Permanent`") + "\n";
        }
        emb.setDescription(text);

        await interaction.reply({ embeds: [emb] });
    }
}