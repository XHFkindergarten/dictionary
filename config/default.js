// 监听端口
const port = 4000

const database = require('./db')

// 开发host
const devHost = 'localhost:4000'
// 生产host
const prdHost = '35.241.100.176:4000'
// 直接使用host
const host = process.env.NODE_ENV=='development'?devHost:prdHost

module.exports = {
  port,
  database,
  host
}