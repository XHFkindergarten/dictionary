// 新建路由实例
const Router = require('koa-router');
const router = new Router()
// 引入配置
const config = require('../config/default')
// 引入定时时间配置
const timeMap = require('../config/timeMap')
// 引入tool
const tools = require('../utils/tools')
// 引入wallpaper
const wallpaper = require('../config/wallpaper')
// 引入axios
const axios = require('axios')
// 引入xml处理包
const fxp = require('fast-xml-parser')
// 引入定时组件
const NodeSchedule = require('node-schedule')

// 引入sequelize
const sequelize = require('../mysql/sequelize')
// 模糊查询组件
const Op = require('sequelize').Op
// 引入单词 Model
const Words = require('../models/WordsModel')
// 引入用户 Model
const User = require('../models/UserModel')
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
// 引入进度记录表 Model
const ScheduleRecord = require('../models/ScheduleRecordModel')
// 引入卡片记录表 Model
const MemoryRecord = require('../models/MemoryRecord')

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
    const {openId, bookList, selected} = ctx.request.body
    if (bookList.length===0) {
      ctx.status = 200
      ctx.body = {
        success: false,
        msg: 'plz choose book'
      }
      return
    }
    // 要添加学习的书籍首先需要把之前的所有书籍删除
    await UserBook.destroy({
      where: {
        openId
      }
    })
    // 修改用户的选书状态
    const user = await User.findOne({
      where: {
        openId
      },
      t
    })
    await user.update({
      selected
    }, t)
    console.log(bookList)
    console.log(openId)
    console.log(selected)
    let res 
    bookList.forEach(async bookId => {
      res = await UserBook.create({
        bookId,
        openId
      })
    })
    // let res
    // bookList.forEach(async bookId => {
    //   res = await UserBook.create({
    //     openId,
    //     bookId
    //   }, t)
    // });
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
  if (sentense) {
    wordInfo.sentense = sentense.slice(0,2)
  }
  const rand = Math.floor(Math.random()*wallpaper.length)
  wordInfo.labelImg=wallpaper[rand]
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
 * @params img2 卡片图 可不传
 * @params freeFront 自定义卡片前置内容 可不传
 * @params freeBack 自定义卡片后置内容 可不传
 * @params voc 单词 单词和自定义内容必须传一个
 */
router.post('/addCard', async ctx => {
  const res = await sequelize.transaction(async t => {
    // 首先判断如果是单词卡片并且已经有这个单词，那么不添加
    const {openId, isFree, voc} = ctx.request.body
    if (isFree===1) {
      const card = await Card.findAll({
        where: {
          openId,
          voc
        },
        t
      })
      if (card.length>0) {
        ctx.status = 200
        ctx.body = {
          success: false,
          msg: '已经存在的卡片'
        }
        return
      }
    }
    const params = ctx.request.body
    // 是否已背  0-待背 1-已背
    const isOk = 1
    // 目前默认可以不传背景图片
    // // 默认背景图
    // if (!params.img) {
    //   const rand = Math.floor(Math.random()*wallpaper.length)
    //   params.img = wallpaper[rand]
    // }
    const createdAt = new Date().getTime()
    console.log(params)
    const createCard = await Card.create({
      ...params,
      isOk,
      createdAt,
      remindAt: createdAt+timeMap[0]
    }, t)
    console.log(createCard.id)
    // ctx.status = 200
    // ctx.body = {
    //   success: true
    // }
    // return
    // 设置时间gap之后将状态修改为待背
    // 由于是创建卡片，nextGap值自动为0(5分钟)
    const {timeSetting, remindAt} = tools.timeGapHandler(0)
    console.log(timeSetting)
    const j = NodeSchedule.scheduleJob(timeSetting, async function(id) {
      const now = new Date()
      console.log('触发函数:'+now)
      const thiscard = await Card.findOne({
        where: {
          id
        }
      })
      await thiscard.update({
        isOk: 0
      }, t)
    }.bind(null, createCard.id))

    ctx.status = 200
    ctx.body = {
      msg: 'create card success',
      success: true
    }
  }).catch(err => {
    ctx.status = 400
  })
})

// 没用过，所以弃用
// /**
//  * @router GET /word/getMyCard
//  * @description 获取个人卡片
//  * @params openId 用户openId
//  */
// router.get('/getMyCard', async ctx => {
//   const openId = ctx.query.openId
//   const cards = await Card.findAll({
//     where: {
//       openId
//     }
//   })
//   ctx.status = 200
//   ctx.body = {
//     success: true,
//     cards
//   }
// })

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
    },
    // 根据更新时间降序查找，最新的卡片在上面
    order: [
      ['remindAt', 'DESC']
    ]
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
 * @access public
 */
router.get('/getVocGroup', async ctx => {
  const openId = ctx.query.openId
  const user = await User.findOne({
    where: {
      openId
    }
  })
  console.log(Boolean(user.selected))
  if (user.selected) {
    console.log('here')
    const books = await UserBook.findAll({
      where: {
        openId
      }
    })
    // 取出第一本书的Id以及进度
    const {bookId, schedule} = books[0]
    //TODO 添加到进度记录表中
    const date = tools.formatToday()
    const records = await ScheduleRecord.findAll({
      where: {
        openId,
        bookId,
        date,
        schedule
      }
    })
    if (records.length===0) {
      const scheduleRecord = await ScheduleRecord.create({
        openId,
        bookId,
        schedule,
        date,
        createdAt: new Date().getTime()
      })
    }

    const words = await BookVoc.findAll({
      where: {
        bookId
      },
      limit: config.groupSize,
      offset: schedule*config.groupSize,
      include: {
        model: Voc,
        as: 'vocInfo'
      }
    })
    const arr = []
    words.forEach(word => {
      arr.push(word.vocInfo)
    })
    ctx.status = 200
    ctx.body = {
      success: true,
      bookId,
      data: arr
    }
  } else {
    // 用户没有选择参考书
    // 从单词库的50000个单词中随机取20个单词
    const rand = Math.floor(Math.random()*2400)
    const arr = await Voc.findAll({
      limit: config.groupSize,
      offset: rand*config.groupSize
    })
    ctx.status = 200
    ctx.body = {
      success: true,
      data: arr
    }
  }
})

/**
 * @router POST /word/updateSchedule
 * @description 完成了一个单词组更新当前图书的进度
 * @params openId 用户openId
 * @params bookId 图书Id
 * @params num 默认为1 
 * @access public
 */
router.post('/updateSchedule', async ctx => {
  const res = await sequelize.transaction(async t => {
    const {openId, bookId} = ctx.request.body
    let num = ctx.request.body.num || 1
    const userbook = await UserBook.findOne({
      where: {
        openId,
        bookId
      },
      t
    })
    const up = await userbook.update({
      schedule: userbook.schedule+num
    }, t)
    ctx.status = 200
    ctx.body = {
      success: true,
      msg: 'update schedule success!'
    }
  }).catch(err => {
    ctx.status = 400
  })
})

/**
 * @router GET /word/getVocRecords
 * @description 获取今天背的单词
 * @params openId
 */
router.get('/getVocRecords', async ctx => {
  const openId = ctx.query.openId

  // 判断用户是否选了书
  const user = await User.findOne({
    where: {
      openId
    }
  })
  if (!user.selected) {
    ctx.status = 200
    ctx.body = {
      success: true,
      typeName: 'Null'
    }
    return
  }

  let words = []
  const date = tools.formatToday()
  const records = await ScheduleRecord.findAll({
    where: {
      openId,
      date
    }
  })
  
  for(let i=0;i<records.length;i++) {
    const vocs = await BookVoc.findAll({
      where: {
        bookId: records[i].bookId
      },
      include: {
        model: Voc,
        as: 'vocInfo'
      },
      limit: config.groupSize,
      offset: records[i].schedule*config.groupSize
    })
    words = words.concat(vocs)
  }

  
  ctx.status = 200
  ctx.body = {
    success: true,
    words,
    typeName: user.selected
  }
})

/**
 * @router POST /word/updateTimeGap
 * @description 更新某张卡片的队列状态
 * @params id 卡片id
 * @params timeGap 提醒时间（可选）
 */
router.post('/updateTimeGap', async ctx => {
  const res = await sequelize.transaction(async t => {
    let {id, timeGap} = ctx.request.body
    console.log('id', id)
    console.log('接收到的timeGap', timeGap)
    const card = await Card.findOne({
      where: {
        id
      },
      t
    })
    if (timeGap!=0&&!timeGap) {
      timeGap = card.nextGap+1
    } else if (timeGap === timeMap.length) {
      timeGap--
    }
    
    console.log('timeGap', timeGap)
    // 修改卡片已背，并且修改timeGap
    const {timeSetting, remindAt} = tools.timeGapHandler(timeGap)

    // 修改这张卡片的待背状态和提醒时间
    const updateCard = await card.update({
      nextGap: timeGap,
      isOk: 1,
      remindAt
    }, t)

    
    const j = NodeSchedule.scheduleJob(timeSetting, async function(id) {
      const now = new Date()
      console.log('触发函数:'+now)
      const thiscard = await Card.findOne({
        where: {
          id
        }
      })
      await thiscard.update({
        isOk: 0
      })
    }.bind(null, id))

    // 在memory_record记录表中更新今天使用卡片的数量
    const openId = card.openId
    const today = tools.formatToday()
    console.log('openId===', openId)
    console.log('today', today)
    const memoryRecord = await MemoryRecord.findOne({
      where: {
        date: today,
        openId
      }
    })
    if (memoryRecord) {
      console.log('has record')
      await memoryRecord.update({
        num: memoryRecord.num+1
      })
    } else {
      console.log('create record')
      await MemoryRecord.create({
        openId,
        date: today,
        num: 1
      })
    }

    ctx.status = 200
    ctx.body = {
      success: true,
      msg: 'update card success'
    }
  })
})

/**
 * @router GET /word/getTaskNum
 * @description 获取某个用户的记忆流数量
 * @params openId
 */
router.get('/getTaskNum', async ctx => {
  const openId = ctx.query.openId
  const cardNum = await Card.count({
    where: {
      openId
    }
  })
  const notOk = await Card.count({
    where: {
      openId,
      isOk: 0
    }
  })
  ctx.status = 200
  ctx.body = {
    success: true,
    totalNum: cardNum,
    taskNum: notOk
  }
})

/**
 * @router GET /word/getToday
 * @description 获取今天的卡片学习数量
 * @params openId
 */
router.get('/getToday', async ctx => {
  const openId = ctx.query.openId
  const date = tools.formatToday()
  const record = await MemoryRecord.findOne({
    where: {
      openId,
      date
    }
  })
  let num
  if (record) {
    num = record.num
  } else {
    num = 0
  }
  ctx.status = 200
  ctx.body = {
    success: true,
    num,
    msg: 'get Today success'
  }
})

/**
 * @router GET /word/addToday
 * @description 增加今天学习过的卡片数量
 * @params openId
 */
router.get('/addToday', async ctx => {
  const openId = ctx.query.openId
  const today = tools.formatToday()
  const memoryRecord = await MemoryRecord.findOne({
    where: {
      date: today,
      openId
    }
  })
  if (memoryRecord) {
    await memoryRecord.update({
      num: memoryRecord.num+1
    })
  } else {
    await MemoryRecord.create({
      openId,
      date: today,
      num: 1
    })
  }
  ctx.status = 200
  ctx.body = {
    success: true,
    msg: 'add today success'
  }
})




module.exports = router.routes()