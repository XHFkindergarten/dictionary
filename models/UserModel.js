const Sequelize = require('sequelize')
const sequelize = require('../mysql/sequelize')

const User = sequelize.define('user', {
  openId: {
    field: 'open_id',
    type: Sequelize.INTEGER,
    primaryKey: true
  },
  nickName: {
    field: 'nick_name',
    type: Sequelize.STRING(30)
  },
  gender: Sequelize.INTEGER,
  country: Sequelize.INTEGER,
  province: Sequelize.INTEGER,
  city: Sequelize.INTEGER,
  avatarUrl: Sequelize.INTEGER,
  createdAt: {
    field: 'created_at',
    type: Sequelize.BIGINT
  },
  selected: Sequelize.STRING(10)
}, {
  // 不要擅自添加时间戳属性
  timestamps: false,
  // 不要擅自将表名变为复数
  freezeTableName: true
});

module.exports = User