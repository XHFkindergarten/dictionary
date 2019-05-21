const timeGap = require('../config/timeGap')
const timeGapHandler = (index) => {
  const time = new Date().getTime()
  const newTime = time + timeGap[index]
  const newDate = new Date(newTime)
  return newDate
  // const second = newTime.getSecond()
  // const minute = newTime.getMinute()
  // const hour = newTime.getHour()
  // const dayOfMonth = newTime.getDate()
  // const month = newTime.getMonth() + 1
  // return {
  //   month,
  //   dayOfMonth,
  //   hour,
  //   minute,
  //   second
  // }
}

module.exports = {
  timeGapHandler
}