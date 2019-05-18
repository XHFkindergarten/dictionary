const Sequelize = require('sequelize')
// 引入连接池配置
const config = require('../config/default').database

const sequelize = new Sequelize(config.database, config.user, config.password, {
  host: config.host,
  dialect: 'mysql',
  pool: {
      max: 5,
      min: 0,
      idle: 30000
  }
});

module.exports = sequelize