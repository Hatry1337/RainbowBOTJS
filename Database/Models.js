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
  items: {
    type: DataTypes.ARRAY(DataTypes.JSON),
    defaultValue: [],
    allowNull: false
  },
  meta: {
    type: DataTypes.JSON,
    defaultValue: {},
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'User'
});


module.exports = {
    User
}