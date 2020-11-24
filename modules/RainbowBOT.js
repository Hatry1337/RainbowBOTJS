const Discord = require("discord.js");
const DBCl = require("./Database");
const DBL = require("dblapi.js");
const Utils = require("./Utils");


class RainbowBOT{
    /**
    * @param {DBCl} Database Database object
    * @param {Discord.Client} Client Discord Client object
    */
    constructor(Database, Client){
        this.Database = Database;
        this.Client = Client;
        this.dbl = new DBL('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU3MTk0ODk5MzY0MzU0NDU4NyIsImJvdCI6dHJ1ZSwiaWF0IjoxNTc1NTczMjAyfQ.9OfSSDWcanClZpsqdFsz7U-1gStTb0SwYZWF49FtrNU', this.Client);
        this.localization = require("../lang").lng;
        /** 
         * @type {Utils}
         */
        this.Utils;

        this.Commands = {
            EightBall:  new (require("../cmds/8ball"))      (this),
            Anecdot:    new (require("../cmds/anecdot"))    (this),
            Ascii:      new (require("../cmds/ascii"))      (this),
        }

        this.Database.rbot = this;
    }
}

module.exports = RainbowBOT;