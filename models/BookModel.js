const Sequelize = require('sequelize')
const sequelize = require('../mysql/sequelize')

const Book = sequelize.define('book', {
  id: {
    type: Sequelize.STRING(30),
    primaryKey: true
  },
  name: Sequelize.TEXT,
  itemNum: {
    field: 'item_num',
    type: Sequelize.INTEGER(11)
  },
  author: Sequelize.TEXT,
  book: Sequelize.TEXT,
  comment: Sequelize.TEXT,
  isbn: Sequelize.TEXT,
  orgnization: Sequelize.TEXT,
  publisher: Sequelize.TEXT,
  version: Sequelize.TEXT,
  type: Sequelize.STRING(255)
}, {
  // 不要擅自添加时间戳属性
  timestamps: false,
  // 不要擅自将表名变为复数
  freezeTableName: true
});

module.exports = Book