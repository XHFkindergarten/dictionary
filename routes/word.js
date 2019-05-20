// 新建路由实例
const Router = require('koa-router');
const router = new Router()
// 引入配置
const config = require('../config/default')
// 引入wallpaper
const wallpaper = require('../config/wallpaper')
// 引入axios
const axios = require('axios')
// 引入xml处理包
const fxp = require('fast-xml-parser')

// 引入sequelize
const sequelize = require('../mysql/sequelize')
// 模糊查询组件
const Op = require('sequelize').Op
// 引入单词 Model
const Words = require('../models/WordsModel')
// 引入书 Model
const Book = require('../models/BookModel')
// 引入书-用户 Model
const UserBook = require('../models/UserBookModel')
// 引入单词表
const Voc = require('../models/VocModel')
// 引入Card Model
const Card = require('../models/CardModel')
// 引入BookVoc Model
const BookVoc = require('../models/BookVocModel')

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

/**
 * @router GET /word/getBookList
 * @description 根据学习内容获取书籍列表
 * @params type
 * @access public
 */
router.get('/getBookList', async ctx => {
  const type = ctx.query.type
  const books = await Book.findAll({
    where: {
      type
    }
  })
  ctx.status = 200
  if (books.length>0) {
    ctx.body = {
      success: true,
      bookList: books
    }
  } else {
    ctx.body = {
      success: false,
      msg: 'No Match Books'
    }
  }
})

/**
 * @router POST /word/addBook
 * @description 用户选择的参考书
 * @params openId
 * @params [array] bookList
 * @access public
 */
router.post('/addBook', async ctx => {
  const res = await sequelize.transaction(async t => {
    const {openId, bookList} = ctx.request.body
    console.log(ctx.request.body)
    // 要添加学习的书籍首先需要把之前的所有书籍删除
    await UserBook.destroy({
      where: {
        openId
      }
    })
    let res
    bookList.forEach(async bookId => {
      res = await UserBook.create({
        openId,
        bookId
      }, t)
    });
    ctx.status = 200
    ctx.body = {
      success: true,
      msg: 'add book success'
    }
  }).catch(err => {
    ctx.status = 400
  })
})

/**
 * @router GET /word/searchWord
 * @description 用户输入时获取搜索建议
 * @params text
 * @access public
 */
router.get('/searchWord', async ctx => {
  const text = ctx.query.text
  const words = await Words.findAll({
    where: {
      word: {
        [Op.like]: `${text}%`
      }
    },
    limit: 10,
    offset: 0
  })
  ctx.status = 200
  ctx.body = {
    success: true,
    words
  }
})

/**
 * @router GET /word/oneWord
 * @description 查询单个单词全部信息
 * @params word
 * @access public 转发第三方金山词霸API
 */
router.get('/oneWord', async ctx => {
  const word = ctx.query.word
  const res = await axios.get('http://dict-co.iciba.com/api/dictionary.php?type=json&key=A3A8D4E818A2A0890BED5298B800C9EB&w='+word)
  const wordInfo = res.data
  // 获取例句
  const res1 = await axios.get('http://dict-co.iciba.com/api/dictionary.php?type=xml&key=A3A8D4E818A2A0890BED5298B800C9EB&w='+word)
  const xml2json = fxp.parse(res1.data)
  const sentense = xml2json.dict.sent
  // 例句只返回两条
  wordInfo.sentense = sentense.slice(0,2)
  wordInfo.sentense.forEach(sen => {
    console.log(sen.orig)
    sen.orig.replace(/&quot;/g, '"')
  })
  ctx.body = {
    success: true,
    word: wordInfo
  }
})

/**
 * @router POST /word/addCard
 * @description 添加个人卡片
 * @params openId 用户openid
 * @params isFree 是否是自定义卡片 0-自定义 1-单词卡片
 * @params img 卡片图 可不传
 * @params freeFront 自定义卡片前置内容 可不传
 * @params freeBack 自定义卡片后置内容 可不传
 * @params voc 单词 单词和自定义内容必须传一个
 */
router.post('/addCard', async ctx => {
  const res = await sequelize.transaction(async t => {
    const params = ctx.request.body
    // 是否已背  0-待背 1-已背
    const isOk = 0
    // 默认背景图
    if (!params.img) {
      const rand = Math.floor(Math.random()*wallpaper.length)
      params.img = wallpaper[rand]
    }
    const createdAt = new Date().getTime()
    console.log(params)
    const createCard = await Card.create({
      ...params,
      isOk,
      createdAt,
      remindAt: createdAt
    }, t)
    ctx.status = 200
    ctx.body = {
      msg: 'create card success',
      success: true
    }
  }).catch(err => {
    ctx.status = 400
  })
})

/**
 * @router GET /word/getMyCard
 * @description 获取个人卡片
 * @params openId 用户openId
 */
router.get('/getMyCard', async ctx => {
  const openId = ctx.query.openId
  const cards = await Card.findAll({
    where: {
      openId
    }
  })
  ctx.status = 200
  ctx.body = {
    success: true,
    cards
  }
})

/**
 * @router GET /word/getMyTask
 * @description 获取个人需要背的卡片
 * @params openId 用户openId
 */
router.get('/getMyTask', async ctx => {
  const openId = ctx.query.openId
  const cards = await Card.findAll({
    where: {
      openId,
      isOk: 0
    }
  })
  ctx.status = 200
  ctx.body = {
    success: true,
    cards
  }
})

/**
 * @router GET /word/getVocGroup
 * @description 生成一个单词组(20个)
 * @params openId 用户openId
 */
router.get('/getVocGroup', async ctx => {
  const openId = ctx.query.openId
  const books = await UserBook.findAll({
    where: {
      openId
    }
  })
  const rand = Math.floor(Math.random()*books.length)
  const bookId = books[rand].bookId
  const words = await BookVoc.findAll({
    where: {
      bookId
    }
  })
  console.log(words)
})


module.exports = router.routes()