import { Access, AccessTarget, Module, Synergy } from "synergy3";
import UTS from "../UnifiedTestSuite/UTS";
import { ChannelType } from "discord-api-types/v10";
import { CommonConfigEntry } from "../../../../Synergy3";

export default class ClassChecker extends Module{
    public Name:        string = "ClassChecker";
    public Description: string = "This module check if Thomasss#9258 visit their classes.";
    public Category:    string = "Other";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.PLAYER() ];

    private _checkInterval!: NodeJS.Timer;
    private dayLastSent: number = 0;

    private configEnabled: CommonConfigEntry<"bool">;
    private configChannel: CommonConfigEntry<"channel">;
    private configMessage: CommonConfigEntry<"string">;

    constructor(bot: Synergy, UUID: string) {
        super(bot, UUID);
        this.configEnabled = this.bot.config.defaultConfigEntry("bot", this.Name, new CommonConfigEntry(
            "class_checker_enabled",
            "State of classes checker",
            "bool",
            false
        ));
        this.configChannel = this.bot.config.defaultConfigEntry("bot", this.Name, new CommonConfigEntry(
            "class_checker_channel",
            "Channel to send checker messages to",
            "channel",
            false
        ));
        this.configMessage = this.bot.config.defaultConfigEntry("bot", this.Name, new CommonConfigEntry(
            "class_checker_message",
            "Message to send in checker channel",
            "string",
            false
        ));
    }

    public async Init() {
        this._checkInterval = setInterval(this.checkTime.bind(this), 5 * 60 * 1000);

        UTS.addTestPoint(
            "class_checker_send_notification",
            "Send notification to Class Checker channel.",
            async (int) => {
                await this.sendNotification();
            }
        );
    }

    private async checkTime() {
        if(!this.configEnabled.getValue()) {
            return;
        }

        let channel = this.configChannel.getValue();

        if(!channel) {
            return;
        }

        let date = new Date();
        let flag =
            // Today is not sunday
            date.getDay() !== 0 &&
            // Not already sent today
            this.dayLastSent !== date.getDate() &&
            // After 9:10
            date.getHours() >= 9 && date.getMinutes() >= 10 &&
            // Until 13:00
            date.getHours() < 13;

        if(!flag) {
            return;
        }

        await this.sendNotification(channel.id);
    }

    private async sendNotification(channelId?: string) {
        if(!channelId) {
            let channel = this.configChannel.getValue();
            if(!channel) {
                return;
            }
            channelId = channel.id;
        }

        try {
            let channel = await this.bot.client.channels.fetch(channelId);

            if(!channel || channel.type !== ChannelType.GuildText) {
                return;
            }

            let message = this.configMessage.getValue();

            if(!message || message.length === 0) {
                return;
            }

            await channel.send({ content: message });
        } catch (err) {
            this.Logger.Warn("Error in checkTime interval:", err);
        }
    }

    public async UnLoad() {
        clearInterval(this._checkInterval);
    }
}