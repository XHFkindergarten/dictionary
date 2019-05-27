const Sequelize = require('sequelize')
const sequelize = require('../mysql/sequelize')

const UserBook = sequelize.define('user_book', {
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
  schedule: Sequelize.INTEGER
}, {
  // 不要擅自添加时间戳属性
  timestamps: false,
  // 不要擅自将表名变为复数
  freezeTableName: true
});

module.exports = UserBook