const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize('postgres://rbot:t6V-b7y-a26-64j@82.146.55.116:5432/rbot')

class User extends Model {}

User.init({
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false
	},
	discord_id: {
		type: DataTypes.STRING,
		allowNull: false
	},
	tag: {
		type: DataTypes.STRING,
		allowNull: false
	},
	perm_group: {
		type: DataTypes.STRING,
		defaultValue: "Player",
		allowNull: false
	},
	money: {
		type: DataTypes.INTEGER,
		defaultValue: 1000,
		allowNull: false
	},
	lvl: {
		type: DataTypes.INTEGER,
		defaultValue: 1,
		allowNull: false
	},
	xp: {
		type: DataTypes.INTEGER,
		defaultValue: 0,
		allowNull: false
	},
	meta: {
		type: DataTypes.JSON,
		defaultValue: {},
		allowNull: false
	},
	lang: {
		type: DataTypes.STRING,
		allowNull: true
	}
}, {
	sequelize,
	modelName: 'User'
});

class Item extends Model {}

Item.init({
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false
	},
	name: {
		type: DataTypes.STRING,
		defaultValue: "Unnamed Item",
		allowNull: false
	},
	description: {
		type: DataTypes.STRING,
		defaultValue: "Ayaya ayaya ayaya",
		allowNull: false
	},
	cost: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	type: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	is_sellable: {
		type: DataTypes.BOOLEAN,
		defaultValue: true,
		allowNull: false
	},
	meta: {
		type: DataTypes.JSON,
		defaultValue: {},
		allowNull: false
	}

}, {
	sequelize,
	modelName: 'Item'
});

class ItemInstance extends Model {}

ItemInstance.init({
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false
	},
	owner_id: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	item_id: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	meta: {
		type: DataTypes.JSON,
		defaultValue: {},
		allowNull: false
	}
}, {
	sequelize,
	modelName: 'ItemInstance'
});

class Log extends Model {}

Log.init({
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false
	},
	type: {
		type: DataTypes.STRING,
		allowNull: false
	},
	user: {
		type: DataTypes.STRING,
		allowNull: false
	},
	server: {
		type: DataTypes.STRING,
		allowNull: false
	},
	data: {
		type: DataTypes.JSON,
		allowNull: false
	},
	timestamp: {
		type: DataTypes.DATE,
		allowNull: false
	},
	unixtime: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
}, {
	sequelize,
	modelName: 'Log'
});



//sequelize.sync({force: true});

module.exports = {
	User,
	Item,
	ItemInstance,
	Log
}