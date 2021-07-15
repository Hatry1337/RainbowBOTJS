const Item = require("./Items/Item");
const Farm = require("./Items/Farm");


class Inventory{
    /**
     * @param {Item[]} items
     * @param {Farm[] | Item[]} big_items
     */
    constructor(items = [], big_items = []){
        this.RegularSlots = items;        // for regular items :)
        this.BigSlots     = big_items;    // for farms and other big stuff :)
    }
}

module.exports = Inventory;