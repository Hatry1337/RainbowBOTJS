import Discord from "discord.js";
import { User } from "synergy3";

export type NeatTopMember = string | Discord.User | User;
export interface NeatTopMemberEntry {
    member: NeatTopMember;
    value: string | number;
}
export class NeatTopBuilder {
    public members: NeatTopMemberEntry[] = [];
    public selfMember?: NeatTopMemberEntry & { place: number };
    public embedOptions?: Omit<Discord.EmbedData, "type" | "description">;

    public selfLabelPattern: string = "You're on %place% place. (%value%)";
    public entryLabelPattern: string = "%place%. %username% - %value%";

    public setMembers(members: NeatTopMemberEntry[]): this {
        this.members = members;
        return this;
    }

    public addMember(member: NeatTopMemberEntry): this {
        this.members.push(member);
        return this;
    }

    public setSelfMember(member: NeatTopMemberEntry & { place: number }): this {
        this.selfMember = member;
        return this;
    }

    /**
     * Pattern can contain such replacement wildcards: **%place%**, **%username%**, **%value%**
     */
    public setSelfLabelPattern(pattern: string): this {
        this.selfLabelPattern = pattern;
        return this;
    }

    /**
     * Pattern can contain such replacement wildcards: **%place%**, **%username%**, **%value%**
     */
    public setEntryLabelPattern(pattern: string): this {
        this.entryLabelPattern = pattern;
        return this;
    }

    public setEmbedOptions(embedOptions: typeof this.embedOptions): this {
        this.embedOptions = embedOptions;
        return this;
    }

    private replaceWildcards(pattern: string, place: number, username: string, value: string | number) {
        return pattern
            .replace(/%place%/gm, `${place}`)
            .replace(/%username%/gm, `${username}`)
            .replace(/%value%/gm, `${value}`);
    }

    private memberToString(member: NeatTopMember, mention?: boolean) {
        if(typeof member === "string") {
            return member;
        } else if(member instanceof Discord.User) {
            if(mention) {
                return `${member.tag} (<@${member.id}>)`;
            }
            return member.tag;
        } else {
            return member.nickname;
        }
    }

    public toString(mention?: boolean, footer?: boolean) {
        let text = "";
        let i = 1;
        for(let m of this.members){
            text += this.replaceWildcards(this.entryLabelPattern,
                i,
                this.memberToString(m.member, mention),
                m.value
            );
            text += "\n";
            i++;
        }

        if(footer && this.selfMember) {
            text += "\n\n";
            text += this.replaceWildcards(this.selfLabelPattern,
                this.selfMember.place,
                this.memberToString(this.selfMember.member, mention),
                this.selfMember.value
            );
        }

        return text;
    }

    public toEmbed(mention: boolean = true) {
        let embed = new Discord.EmbedBuilder(this.embedOptions);

        embed.setDescription(this.toString(mention, false) || "There is no data to show.");

        if(this.selfMember) {
            let footerText = this.replaceWildcards(this.selfLabelPattern,
                this.selfMember.place,
                this.memberToString(this.selfMember.member, false),
                this.selfMember.value
            );
            let footerIcon: string | undefined = undefined;

            if(this.selfMember.member instanceof Discord.User) {
                footerIcon = this.selfMember.member.displayAvatarURL();
            } else if (this.selfMember.member instanceof User){
                footerIcon = this.selfMember.member.discord?.avatar;
            }

            embed.setFooter({
                text: footerText,
                iconURL: this.embedOptions?.footer?.iconURL || footerIcon
            });
        }

        return embed;
    }
}