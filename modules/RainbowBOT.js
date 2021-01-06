const Discord = require("discord.js");
const DBL = require("dblapi.js");
const Utils = require("./Utils");
const EventEmitter = require("events");
const Database = require("../modules/Database");
const { MusicManager } = require("../modules/Models");

/**
 * RainbowBOT Main Class
 * @extends {EventEmitter}
 */
class RainbowBOT extends EventEmitter{
    constructor(){
        super();
        this.setMaxListeners(100);
        this.Client = new Discord.Client();
        this.dbl = new DBL('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU3MTk0ODk5MzY0MzU0NDU4NyIsImJvdCI6dHJ1ZSwiaWF0IjoxNTc1NTczMjAyfQ.9OfSSDWcanClZpsqdFsz7U-1gStTb0SwYZWF49FtrNU', this.Client);
        this.localization = require("../lang").lng;
        /** 
         * @type {Utils}
         */
        this.Utils = new Utils(this);
        /** 
         * @type {Date}
         */
        this.startTimestamp;

        this.Commands = {
            EightBall:  new (require("../cmds/8ball"))      (this),
            Anecdot:    new (require("../cmds/anecdot"))    (this),
            Ascii:      new (require("../cmds/ascii"))      (this),
            Avatar:     new (require("../cmds/Avatar"))     (this),
            Ban:        new (require("../cmds/ban"))        (this),
            Shop:       new (require("../cmds/shop"))       (this),
            Profile:    new (require("../cmds/profile"))    (this),
            Admin:      new (require("../cmds/admin"))      (this),
            Buy:        new (require("../cmds/buy"))        (this),
            Items:      new (require("../cmds/items"))      (this),
            Farm:       new (require("../cmds/farm"))       (this),
            Pinggg:     new (require("../cmds/pinggg"))     (this),
            As:         new (require("../cmds/as"))         (this),
            Clear:      new (require("../cmds/clear"))      (this),
            CowSay:     new (require("../cmds/cowsay"))     (this),
            Pipe:       new (require("../cmds/pipe"))       (this),
            Music:      new (require("../cmds/Music"))      (this),




        }

        this.Client.once('ready', async () => {
            this.startTimestamp = new Date();

            console.log("Caching music channels...")
            var managers = await MusicManager.findAll();
            for(var i in managers){
                var ch = await this.Client.channels.fetch(managers[i].get("music_channel_id")).catch(async e => {
                    if(e && e.code === 10003){
                        console.log(`[${managers[i].get("music_channel_id")}] Channel not found. Deleting manager`)
                        await managers[i].destroy();
                    }
                });
                if(ch){
                    await ch.messages.fetch();
                    console.log(`${parseInt(i)+1}/${managers.length}`);
                }
            }
        });

        this.Client.on('message', async message => {
            if(message.author.id === this.Client.user.id){return}
            if (message.channel.type === "dm") { message.channel.send("Команды в личных сообщениях не поддерживаются :cry:"); return; }
            this.Utils.saveMessage(message);
            if (message.author.bot) return;
            if (!message.content.startsWith("!")) return;
            //const serverQueue = this.Commands.Music.queue.get(message.guild.id);
            this.Utils.checkReg(message).then(async user => {
                await this.Utils.updateUserName(message, user);
                this.Utils.fetchLang(message, user).then(async user => {
                    await this.Utils.checkLang(message, user);
                    this.Utils.checkBan(message, user).then(user => {
                        if(!user) return;
                        this.Utils.checkVip(message, user).then(user => {
                            this.Utils.checkLvl(message, user).then(user =>{
                                if(!user) return;
                                Database.writeLog('Command', message.author.id, message.guild.name, {
                                    Author: message.author.tag,
                                    MContent: message.content,
                                    SVID: message.guild.id,
                                    CHName: message.channel.name,
                                    Message: `User '${message.author.tag}' typed '${message.content}' in '${message.channel.name}' on '${message.guild.name}'.`
                                });
                                this.emit('command', message, user);
                            });
                        });
                    });
                });
            });                
        });



        //Music Events
        this.Client.on("messageReactionAdd", async (reaction, user) => {
            if(user.id === this.Client.user.id){return}
            var manager = await MusicManager.findOne({
                where: {
                    music_message_id: reaction.message.id
                }
            });
            if(manager){
                var member = reaction.message.guild.member(user.id);
                if(member.roles.cache.get(manager.get("dj_role_id"))){
                    this.emit("music_reaction", member, reaction, manager);
                }else{
                    await reaction.users.remove(user.id);
                }
            }
        });

        this.Client.on('message', async message => {
            if(message.author.id === this.Client.user.id){return}
            var manager = await MusicManager.findOne({
                where: {
                    music_channel_id: message.channel.id
                }
            });
            if(manager){
                if(message.member.roles.cache.get(manager.get("dj_role_id"))){
                    this.emit("music_message", message.member, message, manager);
                }else{
                    await message.delete();
                }
            }
        });
    }

    /**
     * @returns {number}
     */
    getUptime(){
        if(!this.startTimestamp){
            return 0;
        }else{
            return (new Date() - this.startTimestamp) / 1000;
        }
    }
}

module.exports = RainbowBOT;