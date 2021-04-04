const { Item: ItemModel, User: UserModel, ItemInstance: ItemInstanceModel } = require("../Models");
const Database = require("../Database");
const RainbowBOT = require("../RainbowBOT");
const Item = require("../Item");
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
     * 
     * @param {number} id Farm item ID
     * @returns {Promise<Farm>} 
     */
    static Fetch(id){
        return new Promise(async (resolve, reject) => {
            var opts = {
                
            }
            var farm = await ItemInstanceModel.findOne({
                where: {
                    id: id
                }
            });
            
        });
    }
}

module.exports = Case;