// 监听端口
const port = 4000

const database = require('./db')

// 小程序id
const appId = 'wx662f8bf22db0e248'
// 小程序secret码
const appSecret = 'ef3fd582360681d1e43360c634e37833'

// 开发host
const devHost = 'localhost:4000'
// 生产host
const prdHost = '35.241.100.176:4000'
// 直接使用host
const host = process.env.NODE_ENV=='development'?devHost:prdHost

// 图片服务器
const imgHost = ''

module.exports = {
  port,
  appId,
  appSecret,
  database,
  host,
  imgHost
}