const { Item: ItemModel, User: UserModel, ItemInstance: ItemInstanceModel } = require("../Models");
const Database = require("../Database");
const RainbowBOT = require("../RainbowBOT");
const Item = require("../Item");

/**
 * @extends {Item}
 */
class VideoCard extends Item{
    /**
     * @param {object} opts 
     * @param {RainbowBOT} rbot
     */
    constructor(opts, rbot){
        super(opts, rbot);
        /**
         * @type {number} How much this card mine per minute
         */
        this.MiningRate    = opts.mining_rate;
        /**
         * @type {number} Durability of the video card
         */
        this.Durability    = opts.durability;
        /**
         * @type {number} Maximal durability of the video card
         */
        this.MaxDurability = opts.max_durability;
        /**
         * @type {number} How much energy this card uses per minute
         */
        this.Power         = opts.power;
    }
}

module.exports = VideoCard;