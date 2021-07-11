const { Item: ItemModel, User: UserModel, ItemInstance: ItemInstanceModel } = require("../../../Models");
const RainbowBOT = require("../RainbowBOT");
const Item = require("..Item");

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
         * @type {number} Item's Unique Type ID
         */
         this.UTID = 2;
         /**
         * @type {string} Item Type
         */
        this.Type = "VideoCard";
        /**
         * @type {string} Item's Name
         */
        this.Name = "Nvidia GeForce GTX 1050Ti";
        /**
         * @type {string} Item's Description
         */
        this.Description  = "Low cost videocard.";
        /**
         * @type {number} Item's Cost
         */
        this.Cost = 250;
        /**
         * @type {boolean} Is Item Sellable
         */
        this.isSellable = true;

        /**
         * @type {number} How much this card mine per minute
         */
        this.MiningRate = 0.5;
        /**
         * @type {number} Durability of the video card
         */
        this.Durability = 100;
        /**
         * @type {number} Maximal durability of the video card
         */
        this.MaxDurability = 100;
        /**
         * @type {number} How much energy this card uses
         */
        this.Power = 75;
    }
}

module.exports = VideoCard;