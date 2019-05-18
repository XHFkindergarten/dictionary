const Sequelize = require('sequelize')
const sequelize = require('../mysql/sequelize')

const Words = sequelize.define('words', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true
  },
  word: Sequelize.STRING(255),
  // exchange: Sequelize.STRING(1000),
  // voice: Sequelize.STRING(1000),
  times: Sequelize.INTEGER,
  prefix: Sequelize.STRING(10)
}, {
  // 不要擅自添加时间戳属性
  timestamps: false,
  // 不要擅自将表名变为复数
  freezeTableName: true
});

module.exports = Words