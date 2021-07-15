const { Item: ItemModel, User: UserModel, ItemInstance: ItemInstanceModel } = require("./Models");
const RainbowBOT = require("./RainbowBOT");
const Item = require("./Items/Item");
const Case = require("./Items/Case");
const VideoCard = require("./Items/VideoCard");
const Farm = require("./Items/Farm");

class ItemsController {
    /**
     * @param {RainbowBOT} rbot 
     */
    constructor(rbot){
        this.rbot = rbot;
        this.Items = {
            Item:      new (require("./Items/Item"))                 (this),
            GTX1050Ti: new (require("./Items/VideoCards/GTX1050Ti")) (this)
        }
    }

    /**
     * 
     * @param {number} id Item ID
     * @returns {Promise<Item>}
     */
    FetchItem(id){
        return new Promise(async (res, rej) => {
            var item = await ItemInstanceModel.findOne({
                where:{
                    id: id
                }
            });
            var proto = await ItemModel.findOne({
                where:{
                    id: item.item_id
                }
            });
            var opts = {
                //Item Options.
                id: item.id,
                proto_id: item.item_id,
                owner_id: item.owner_id,
                type: proto.type,
                name: proto.name,
                description: proto.description,
                cost: proto.cost,
                isSellable: proto.is_sellable,
                instMeta: item.meta,
                protoMeta: proto.meta
            }
            res(new Item(opts, this.rbot));
        });
    }

    /**
     * 
     * @param {number} id Item ID
     * @returns {Promise<Item>}
     */
    FetchItemCase(id){
        return new Promise(async (res, rej) => {
            var item = await ItemInstanceModel.findOne({
                where:{
                    id: id
                }
            });
            var proto = await ItemModel.findOne({
                where:{
                    id: item.item_id
                }
            });
            if(!proto.type === 2){
                res(null);
                return;
            }
            var opts = {
                //Item Options:
                id: item.id,
                proto_id: item.item_id,
                owner_id: item.owner_id,
                type: proto.type,
                name: proto.name,
                description: proto.description,
                cost: proto.cost,
                isSellable: proto.is_sellable,
                instMeta: item.meta,
                protoMeta: proto.meta,

                //Case Options:
                slots_count: proto.meta.slots
            }
            res(new Case(opts, this.rbot));
        });
    }

    /**
     * 
     * @param {number} id Item ID
     * @returns {Promise<Item>}
     */
    FetchItemVideoCard(id){
        return new Promise(async (res, rej) => {
            var item = await ItemInstanceModel.findOne({
                where:{
                    id: id
                }
            });
            var proto = await ItemModel.findOne({
                where:{
                    id: item.item_id
                }
            });
            if(!proto.type === 1){
                res(null);
                return;
            }
            var opts = {
                //Item Options:
                id: item.id,
                proto_id: item.item_id,
                owner_id: item.owner_id,
                type: proto.type,
                name: proto.name,
                description: proto.description,
                cost: proto.cost,
                isSellable: proto.is_sellable,
                instMeta: item.meta,
                protoMeta: proto.meta,

                //VideoCard Options:
                mining_rate: proto.meta.mining_rate,
                durability: item.meta.durability,
                max_durability: proto.meta.max_durability,
                power: proto.meta.power
            }
            res(new VideoCard(opts, this.rbot));
        });
    }

    /**
     * 
     * @param {number} id Item ID
     * @returns {Promise<Item>}
     */
    FetchItemFarm(id){
        return new Promise(async (res, rej) => {
            var item = await ItemInstanceModel.findOne({
                where:{
                    id: id
                }
            });
            var proto = await ItemModel.findOne({
                where:{
                    id: item.item_id
                }
            });
            if(!proto.type === 3){
                res(null);
                return;
            }
            var icase = await this.FetchItemCase(item.meta.case);
            var vcards = [];
            for(var s of item.meta.slots){
                vcards.push(await this.FetchItemVideoCard(s));
            }
            var opts = {
                //Item Options:
                id: item.id,
                proto_id: item.item_id,
                owner_id: item.owner_id,
                type: proto.type,
                name: proto.name,
                description: proto.description,
                cost: proto.cost,
                isSellable: proto.is_sellable,
                instMeta: item.meta,
                protoMeta: proto.meta,

                //Farm Options:
                case: icase,
                slots: vcards
            }
            res(new Farm(opts, this.rbot));
        });
    }

}

module.exports = ItemsController;