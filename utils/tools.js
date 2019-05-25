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
  return {
    timeSetting,
    // 提醒时间bigint类型
    remindAt: time
  }
}

/**
 * 获取今天的时间格式
 * fullYear-month-day
 */
const formatToday = () => {
  const date = new Date()
  const d = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
  return d
} 

/**
 * 计算倒计时还有多少时间
 */
const timeCount = (remindAt, now) => {
  const count = remindAt - now
  if (count<0) {
    return 'waiting now'
  } else if (count>1000&&count<60*1000) {
    return 'within 1 minute'
  } else if (count>60*1000&&count<60*60*1000) {
    return `${Math.floor(count/(60*1000))}${count/(60*1000)!=1?'minutes':'minute'}`
  } else if (count>60*60*1000&&count<24*60*60*1000) {
    return `${Math.floor(count/(60*60*1000))}${count/(60*60*1000)!=1?'hours':'hour'}`
  } else if (count > 24*60*60*1000) {
    return `${Math.floor(count/(24*60*60*1000))}${count/(24*60*60*1000)!=1?'days':'day'}`
  }
}

module.exports = {
  timeGapHandler,
  formatToday,
  timeCount
}