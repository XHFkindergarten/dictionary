const Sequelize = require('sequelize')
const sequelize = require('../mysql/sequelize')

const ScheduleRecord = sequelize.define('schedule_record', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  openId: {
    field: 'open_id',
    type: Sequelize.STRING(255)
  },
  bookId: {
    field: 'book_id',
    type: Sequelize.STRING(255)
  },
  date: Sequelize.STRING(30),
  schedule: Sequelize.INTEGER,
  createdAt: {
    field: 'created_at',
    type: Sequelize.BIGINT
  }
},{
  // 不要擅自添加时间戳属性
  timestamps: false,
  // 不要擅自将表名变为复数
  freezeTableName: true
})

module.exports = ScheduleRecord