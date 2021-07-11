const { Item: ItemModel, User: UserModel, ItemInstance: ItemInstanceModel } = require("../Models");
const Database = require("../Database");
const RainbowBOT = require("../RainbowBOT");
const Item = require("./Item");
const VideoCard = require("./VideoCard");
const Case = require("./Case");


/**
 * @extends {Item}
 */
class Farm extends Item{
    /**
     * @param {object} opts 
     * @param {RainbowBOT} rbot
     */
    constructor(opts, rbot){
        super(opts, rbot);
        /**
         * @type {Case}
         */
        this.Case    = opts.case;
        /**
         * @type {VideoCard[]} Video cards in this farm
         */
        this.Slots = opts.slots;
    }

    /**
     * @returns {number}
     */
    GetMiningRate(){
        var summ = 0;
        for(var c of this.Slots){
            c += c.MiningRate;
        }
    }

    /**
     * @returns {number}
     */
    GetPowerUsage(){
        var summ = 0;
        for(var c of this.Slots){
            c += c.MiningRate;
        }
    }

}

module.exports = Farm;