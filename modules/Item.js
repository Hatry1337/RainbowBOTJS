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
        this.rbot         =   rbot;
        this.id           =   opts.id;
        this.owner_id     =   opts.owner_id;
        this.type_id      =   opts.type_id;
        this.ctype        =   opts.ctype;
        this.name         =   opts.name;
        this.description  =   opts.description;
        this.cost         =   opts.cost;
        this.isSellable   =   opts.isSellable;
        this.itemMeta     =   opts.itemMeta;
        this.instMeta     =   opts.instMeta;
    }

    /**
     * 
     * @param {number} id item id 
     */
    static get(id){
        return new Promise(async (res, rej) => {
            var instance = await ItemInstanceModel.findOne({
                where:{
                    id: id
                }
            });
            //var item =
        });
    }

    /**
     * 
     * @param {number} id 
     * @returns {Promise<Item>}
     */
    transfer(id){
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