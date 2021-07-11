const { Item: ItemModel, User: UserModel, ItemInstance: ItemInstanceModel } = require("../Models");
const Database = require("../Database");
const RainbowBOT = require("../RainbowBOT");
const Item = require("./Item");
const VideoCard = require("./VideoCard");

/**
 * @extends {Item}
 */
class Case extends Item{
    /**
     * @param {object} opts 
     * @param {RainbowBOT} rbot
     */
    constructor(opts, rbot){
        super(opts, rbot);
        /**
         * @type {number} How much vcard slots that case have
         */
        this.SlotsCount    = opts.slots_count;
    }
}

module.exports = Case;