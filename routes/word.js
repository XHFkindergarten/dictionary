// 新建路由实例
const Router = require('koa-router');
const router = new Router()
// 引入配置
const config = require('../config/default')

// 引入sequelize
const sequelize = require('../mysql/sequelize')
// 引入单词 Model
const Words = require('../models/WordsModel')

/**
 * @router GET /word/getWord
 * @description 根据id获取单个单词
 * @access public 接口是公开的
 */
router.get('/getWord', async ctx => {
  const id = ctx.query.id
  const word = await Words.findAll()
  ctx.status = 200
  ctx.body = {
    success: true,
    word
  }
})

/**
 * @router GET /word/getWordByPrefix
 * @description 根据首字母获取单词
 * @access public 接口是公开的
 */
router.get('/getWordByPrefix', async ctx => {
  const prefix = ctx.query.prefix
  const words = await Words.findAll({
    where: {
      prefix
    }
  })
  if (words) {
    ctx.status = 200
    ctx.body = {
      success: true,
      words
    }
    return
  }
  ctx.status = 400
})



module.exports = router.routes()