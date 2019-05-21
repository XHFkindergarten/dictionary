const Sequelize = require('sequelize')
const sequelize = require('../mysql/sequelize')
const Voc = require('./VocModel')

const BookVoc = sequelize.define('book_voc', {
  id: {
    type: Sequelize.STRING(30),
    primaryKey: true
  },
  bookId: {
    field: 'book_id',
    type: Sequelize.TEXT
  },
  vocId: {
    field: 'voc_id',
    type: Sequelize.TEXT
  },
  flag: Sequelize.INTEGER,
  tag: Sequelize.TEXT,
  order: Sequelize.DOUBLE
}, {
  // 不要擅自添加时间戳属性
  timestamps: false,
  // 不要擅自将表名变为复数
  freezeTableName: true
});

// 联表查询
BookVoc.belongsTo(Voc, {
  foreignKey: 'vocId',
  as: 'vocInfo'
})

module.exports = BookVoc