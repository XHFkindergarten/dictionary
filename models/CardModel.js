const Sequelize = require('sequelize')
const sequelize = require('../mysql/sequelize')

const Card = sequelize.define('card', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true
  },
  openId: {
    field: 'open_id',
    type: Sequelize.STRING(255)
  },
  isOk: {
    field: 'is_ok',
    type: Sequelize.INTEGER
  },
  isFree: {
    field: 'is_free',
    type: Sequelize.INTEGER
  },
  img: Sequelize.STRING(255),
  freeFront: {
    field: 'free_front',
    type: Sequelize.TEXT
  },
  freeBack: {
    field: 'free_back',
    type: Sequelize.TEXT
  },
  voc: Sequelize.STRING(255),
  createdAt: {
    field: 'created_at',
    type: Sequelize.BIGINT
  },
  remindAt: {
    field: 'remind_at',
    type: Sequelize.BIGINT
  }
},{
  // 不要擅自添加时间戳属性
  timestamps: false,
  // 不要擅自将表名变为复数
  freezeTableName: true
})

module.exports = Card