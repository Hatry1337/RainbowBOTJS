import { Access, AccessTarget, Module } from "synergy3";
import UTS from "../UnifiedTestSuite/UTS";

export default class ClassChecker extends Module{
    public Name:        string = "ClassChecker";
    public Description: string = "This module check if Thomasss#9258 visit their classes.";
    public Category:    string = "Other";
    public Author:      string = "Thomasss#9258";

    public Access: AccessTarget[] = [ Access.PLAYER() ];

    private _checkInterval!: NodeJS.Timer;
    private dayLastSent: number = 0;

    public async Init() {
        await this.bot.config.setIfNotExist("bot", "class_checker_enabled", false, "bool");
        await this.bot.config.setIfNotExist("bot", "class_checker_channel", {}, "channel");
        await this.bot.config.setIfNotExist("bot", "class_checker_message", {}, "string");

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
        if(!(await this.bot.config.get("bot", "class_checker_enabled"))) {
            return;
        }

        let channelId = await this.bot.config.get("bot", "class_checker_channel");

        if(!channelId) {
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


    }

    private async sendNotification(channelId?: string) {
        if(!channelId) {
            channelId = await this.bot.config.get("bot", "class_checker_channel");
            if(!channelId) {
                return;
            }
        }

        try {
            let channel = await this.bot.client.channels.fetch(channelId);

            if(!channel || !channel.isTextBased()) {
                return;
            }
            await channel.send({ content: await this.bot.config.get("bot", "class_checker_message") });
        } catch (err) {
            this.Logger.Warn("Error in checkTime interval:", err);
        }
    }

    public async UnLoad() {
        clearInterval(this._checkInterval);
    }
}