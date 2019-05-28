const router = require('koa-router')()
const User = require('../models/UserModel')
const Word = require('../models/WordsModel')
const Card = require('../models/CardModel')
const PunchRecord = require('../models/PunchRecordModel')
const config = require('../config/default')
const WXB = require('../utils/WXBizDataCrypt')
const axios = require('axios')
const sequelize = require('../mysql/sequelize')
// 引入七牛云插件
const qiniu = require('qiniu')
// 引入定时组件
const NodeSchedule = require('node-schedule')
const tools = require('../utils/tools')

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello, this is Abandon NotePad'
  })
})

/**
 * @router POST /login
 * @description 获取登录态信息
 * @params code 登录码
 * @access public
 */
router.post('/login', async ctx => {
  const code = ctx.request.body.code
  const res = await axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=${config.appId}&secret=${config.appSecret}&js_code=${code}&grant_type=authorization_code`)
  const user = await User.findOne({
    where: {
      openId: res.data.openid
    }
  })
  if (user) {
    const userInfo = {
      openId: res.data.openid,
      nickName: user.nickName,
      gender: user.gender,
      country: user.country,
      province: user.province,
      city: user.city,
      avatarUrl: user.avatarUrl,
      selected: user.selected
    }
    console.log(userInfo)
    ctx.status = 200
    ctx.body = {
      success: true,
      userInfo
    }
  } else {
    ctx.status = 200
    ctx.body = {
      success: false
    }
  }
})



/**
 * @router POST /register
 * @description 用户注册
 * @params nickName 昵称
 * @params gender 性别
 * @params country 国家
 * @params province 省份
 * @params city 城市
 * @params avatarUrl 头像Url
 * @params code 登录码
 * @access public
 */
router.post('/register', async ctx => {
  const res = await sequelize.transaction(async t => {
    const createdAt = new Date().getTime()
    const {nickName, gender, city, province, country, avatarUrl, code} = ctx.request.body
    // 获取openid和sessionKey
    const res = await axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=${config.appId}&secret=${config.appSecret}&js_code=${code}&grant_type=authorization_code`)
    const openId = res.data.openid
    const user = await User.findOne({
      where: {
        openId
      }
    })
    console.log('search user', user)
    if (user) {
      ctx.status = 200
      ctx.body = {
        success: true,
        hasRegister: true
      }
      return
    }else {
      const createUser = await User.create({
        openId,
        nickName,
        gender,
        city,
        province,
        country,
        avatarUrl,
        createdAt
      }, t)
      ctx.status = 200
      ctx.body = {
        success: true,
        hasRegister: false,
        msg: 'register success',
        openId
      }
    }
  }).catch(() => {
    ctx.status = 400
  })
})

// 七牛云的公钥和私钥
const accessKey = 'WFCJDsqbMl_VxaFpz4cyh2DUrH5bk_2C9YpICq_-';
const secretKey = 'sNBjhBK3N1qt7_1V_qxnQ4G24St1dkhCdGjVFzGJ';
// 存储空间名称
const bucket = 'testsavezone';

/**
 * @router GET /getQnToken
 * @params accessKey
 * @params secretKey
 */
router.get('/getQnToken', async ctx => {
  let mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  let options = {
    scope: bucket,
    expires: 3600 * 24
  };
  let putPolicy =  new qiniu.rs.PutPolicy(options);
  let uploadToken= putPolicy.uploadToken(mac);
  if (uploadToken) {
    ctx.status = 200
    ctx.body = {
      success: true,
      token: uploadToken
    }
    return
  }
  ctx.status = 400
})

// /**
//  * @router GET /wdnmd
//  * @params openId
//  * @description 用户不想选书，就给他记录一下selectd
//  */
// router.get('/wdnmd', async ctx => {
//   const openId = ctx.query.openId
//   const user = await User.findOne({
//     where: {
//       openId
//     }
//   })
//   await user.update({
//     selected: 'WDNMD'
//   })
//   ctx.status = 200
//   ctx.body = {
//     success: true,
//     msg: 'wdnmd success',
//     userInfo: user
//   }
// })

/**
 * @router GET /mycard
 * @params openId
 * @description 获取用户的所有卡片以及倒计时时间
 */
router.get('/mycard', async ctx => {
  const openId = ctx.query.openId
  const cards = await Card.findAll({
    where: {
      openId
    },
    order: [
      ['remindAt', 'DESC']
    ]
  })
  const time = new Date().getTime()
  const arr = []
  cards.forEach(card => {
    console.log(tools.timeCount(card.remindAt, time))
    arr.push({
      id: card.id,
      voc: card.voc,
      img: card.img,
      title: card.title,
      front: card.freeFront,
      back: card.freeBack,
      isFree: card.isFree,
      countTime:tools.timeCount(card.remindAt, time)
    })
  })
  ctx.status = 200
  ctx.body = {
    success: true,
    cards: arr
  }
})

/**
 * @router POST /punch
 * @params openId
 * @description 打卡
 */
router.get('/punch', async ctx => {
  const openId = ctx.query.openId
  const date = tools.formatToday()
  const punchNum = await PunchRecord.count({
    where: {
      openId
    }
  })
  const record = await PunchRecord.findOne({
    where: {
      openId,
      date
    }
  })
  if (record) {
    // 如果今天已经打卡了
    ctx.status = 200
    ctx.body = {
      success: true,
      hasPunch: true,
      punchNum
    }
    return
  } else {
    const create = await PunchRecord.create({
      openId,
      date
    })
    ctx.status = 200
    ctx.body = {
      success: true,
      hasPunch: false,
      punchNum: punchNum+1
    }
  }
})

/**
 * @router GET /updateCards
 * @description 每一个小时更新一次所有卡片的状态
 */
router.get('/updateCards', async ctx => {
  const j = NodeSchedule.scheduleJob('00 * * * *', async function() {
    console.log('定期检查卡片状态')
    const cards = await Card.findAll()
    const time = new Date().getTime()
    cards.forEach(async card => {
      if (card.remindAt < time) {
        await card.update({
          isOk: 0
        })
      }
    })
    ctx.status = 200
    ctx.body = {
      success: true
    }
  })
})



module.exports = router.routes()
