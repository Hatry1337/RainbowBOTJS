const { Item: ItemModel, User: UserModel, ItemInstance: ItemInstanceModel } = require("./Models");
const Database = require("./Database");
const RainbowBOT = require("./RainbowBOT");

class Item {
    /**
     * 
     * @param {object} opts 
     * @param {RainbowBOT} rbot 
     */
    constructor(opts, rbot){
        /**
         * @type {number} Item's ID
         */
        this.id           =   opts.id;
        /**
         * @type {number} Item's Prototype ID
         */
        this.ProtoID      =   opts.proto_id;
         /**
         * @type {number} Item's Owner ID
         */
        this.OwnerID      =   opts.owner_id;
        /**
         * @type {string} Item's Name
         */
        this.Name         =   opts.name;
        /**
         * @type {string} Item's Description
         */
        this.Description  =   opts.description;
        /**
         * @type {number} Item's Cost
         */
        this.Cost         =   opts.cost;
        /**
         * @type {boolean} Is Item Sellable
         */
        this.isSellable   =   opts.isSellable;
        /**
         * @type {object} Item's Metadata
         */
        this.Meta          =   opts.instMeta;
        /**
         * @type {object} Item's Prototype Metadata
         */
        this.ProtoMeta     =   opts.itemMeta;
        /**
         * @type {RainbowBOT} RainbowBOT 
         */
        this.rbot          =   rbot;
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

    /**
     * 
     * @returns {Promise<void>}
     */
    destroy(){
        return new Promise(async (res, rej) => {
            await ItemInstanceModel.destroy({
                where:{
                    id: this.id
                }
            });
            delete this;
            res();
        });
    }
}

module.exports = Item;