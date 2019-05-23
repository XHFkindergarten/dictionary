const timeMap = require('../config/timeMap')
const nodeSchedule = require('node-schedule')
const timeGapHandler = (index) => {
  let time = new Date().getTime()
  time += timeMap[index]
  const newDate = new Date(time)
  console.log('应该触发时间', newDate)
  const year = newDate.getFullYear()
  const month = newDate.getMonth()
  const day = newDate.getDate()
  const hour = newDate.getHours()
  const minute = newDate.getMinutes()
  const second = newDate.getSeconds()
  const timeSetting = new Date(year, month, day, hour, minute, second)

  // const date0 = new Date().getTime()
  // console.log('时间间隔'+timeMap[index]/(60*1000)+'min')
  // const newTime = date0+timeMap[index]
  // const date = new Date(newTime)
  // console.log('应该触发时间' + date)
  // const year = date.getFullYear()
  // const month = date.getMonth()
  // const day = date.getDate()
  // const hour = date.getHours()
  // const minute = date.getMinutes()
  // const second = date.getSeconds()

  return {
    timeSetting,
    // 提醒时间bigint类型
    remindAt: time
  }
}

module.exports = {
  timeGapHandler
}