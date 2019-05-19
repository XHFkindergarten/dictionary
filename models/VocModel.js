const Sequelize = require('sequelize')
const sequelize = require('../mysql/sequelize')

const Voc = sequelize.define('voc', {
  id: {
    type: Sequelize.STRING(30),
    primaryKey: true
  },
  vocabulary: Sequelize.TEXT,
  phonetic_uk: Sequelize.TEXT,
  phonetic_us: Sequelize.TEXT,
  frequency: Sequelize.DOUBLE,
  difficulty: Sequelize.INTEGER,
  acknowledgeRate: {
    field: 'acknowledge_rate',
    type: Sequelize.DOUBLE
  }
}, {
  // 不要擅自添加时间戳属性
  timestamps: false,
  // 不要擅自将表名变为复数
  freezeTableName: true
});

module.exports = Voc