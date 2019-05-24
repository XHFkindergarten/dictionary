const Sequelize = require('sequelize')
const sequelize = require('../mysql/sequelize')

const MemoryRecord = sequelize.define('memory_record', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true
  },
  openId: {
    field: 'open_id',
    type: Sequelize.STRING(30)
  },
  date: Sequelize.STRING(10),
  num: Sequelize.INTEGER
}, {
  // 不要擅自添加时间戳属性
  timestamps: false,
  // 不要擅自将表名变为复数
  freezeTableName: true
});

module.exports = MemoryRecord