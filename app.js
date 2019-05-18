const Koa = require('koa')
const app = new Koa()

const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
// const bodyparser = require('koa-bodyparser')
const koaBody = require('koa-body')
const logger = require('koa-logger')

const Router = require('koa-router')
const router = new Router()

// koa-cors跨域插件
const KoaCors = require('koa-cors')
app.use(KoaCors())


// error handler
onerror(app)

// 使用koa-body中间件来处理multipart请求类型(上传文件)(需要在router挂载之前)
app.use(koaBody({
  multipart: true,  // 支持文件上传
  formLimit: 2*1024*1024,
  formidable: {
    maxFieldsSize: 20*1024*1024
  }
}))

// 美化和简化返回json格式response
app.use(json())
app.use(logger())

// 静态文件中间件，public文件夹中的内容可以被外部访问(需要在router挂载之前)
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))

// logger
// 输出：请求方法 请求路由名 — 执行时间
// app.use(async (ctx, next) => {
//   const start = new Date()
//   await next()
//   const ms = new Date() - start
//   console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
// })

// routes
// 引入index路由
const index = require('./routes/index')
router.use(index)
// // 引入user路由
// const users = require('./routes/users')
// router.use('/users', users)
// 引入word路由
const word = require('./routes/word')
router.use('/word', word)

// 将router挂载在app上
app.use(router.routes()).use(router.allowedMethods());


// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
