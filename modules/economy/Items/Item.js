const { Item: ItemModel, User: UserModel, ItemInstance: ItemInstanceModel } = require("../Models");
const Database = require("../Database");
const RainbowBOT = require("../RainbowBOT");

class Item {
    /**
     * 
     * @param {RainbowBOT} rbot 
     */
    constructor(rbot){
        /**
         * @type {number} Item's ID
         */
        this.id = 0;
        /**
         * @type {number} Item's Unique Type ID
         */
        this.UTID = 0;
         /**
         * @type {number} Item's Owner ID
         */
        this.OwnerID = 0;
         /**
         * @type {string} Item Type
         */
        this.Type = "Item";
        /**
         * @type {string} Item's Name
         */
        this.Name = "Unnamed Item";
        /**
         * @type {string} Item's Description
         */
        this.Description  = "Empty item template";
        /**
         * @type {number} Item's Cost
         */
        this.Cost = 0;
        /**
         * @type {boolean} Is Item Sellable
         */
        this.isSellable = false;
        /**
         * @type {object} Item's Metadata
         */
        this.Meta = {}
        /**
         * @type {RainbowBOT} RainbowBOT 
         */
        this.rbot = rbot;
    }

    /**
     * 
     * @param {number} id User ID
     * @returns {Promise<Item>}
     */
    setOwner(id){
        return new Promise(async (res, rej) => {
            await ItemInstanceModel.update({
                owner_id: id
            },{
                where:{
                    id: this.id
                }
            });
            this.owner_id = id;
            res(this);
        });
    }
}

module.exports = Item;