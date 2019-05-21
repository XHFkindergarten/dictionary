const router = require('koa-router')()
const User = require('../models/UserModel')
const Word = require('../models/WordsModel')
const config = require('../config/default')
const WXB = require('../utils/WXBizDataCrypt')
const axios = require('axios')
const sequelize = require('../mysql/sequelize')

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
      msg: 'register success',
      openId
    }
    return
  }).catch(() => {
    ctx.status = 400
  })
})



module.exports = router.routes()
