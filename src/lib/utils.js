import moment from 'moment'

import 'moment/locale/zh-cn'
moment.locale('zh-cn')

export { moment }
export const startDate = moment().subtract(30, 'days')
export const endDate = moment()

export const formatStartDate = startDate.format('YYYY-MM-DD')
export const formatEndDate = endDate.format('YYYY-MM-DD')

export const formatToMin = value => moment(value).format('YYYY-MM-DD HH:mm')
export const formatToDay = value => moment(value).format('YYYY-MM-DD')

export const toRoute = path => path.replace(/\/$/, '') || '/'

export const diff = (a, b, ignoreKeys = [], strict = false) => {
  const diff = {}
  const equal = strict ? strictNotEqual : normalNotEqual
  // 比较a b两个对象
  for (const i in a) {
    if (equal(b[i], a[i]) && ignoreKeys.indexOf(i) === -1) {
      diff[i] = a[i]
    }
  }

  for (const i in b) {
    if (equal(b[i], a[i]) && ignoreKeys.indexOf(i) === -1) {
      diff[i] = b[i]
    }
  }
  return diff
}

const strictNotEqual = (a, b) => a !== b
/*eslint-disable */
const normalNotEqual = (a, b) => a != b
/*eslint-disable */

export const getLength = str => {
  if (!str) return 0
  let realLength = 0
  let len = str.length
  let charCode = -1
  for (let i = 0; i < len; i++) {
    charCode = str.charCodeAt(i)
    if (charCode > 0 && charCode <= 128) {
      realLength += 1
    } else {
      realLength += 2
    }
  }
  return realLength
}

export const beforeUnload = e => {
  const confirmationMessage = '您可能有数据没有保存'

  e.returnValue = confirmationMessage
  return confirmationMessage
}

export const prepareParams = (args = {}, useDefault = true) => {
  let { startDate, endDate, imageId, current, pageSize, order, by } = args

  // 使用默认参数, 默认开启
  if (useDefault) {
    if (!current) current = 1
    if (!pageSize) pageSize = 10
  }

  // 值如果为undefind 会忽略
  return {
    start_date: startDate,
    end_date: endDate,
    image_id: imageId,
    per_page: pageSize,
    page: current,
    order,
    by
  }
}

export const autoBlur = () => {
  document.addEventListener('click' , function(e) {
    if (e.target.nodeName.toUpperCase() === 'BUTTON') {
      e.target.blur()
    }
  })
}

export const scrollUnique = target => {
  let eventType = 'mousewheel'
  if (document.mozHidden !== undefined) {
    eventType = 'DOMMouseScroll'
  }

  target.addEventListener(eventType, function(e) {
    const scrollTop = target.scrollTop
    const scrollHeight = target.scrollHeight
    const height = target.clientHeight

    const delta = e.wheelDelta
      ? e.wheelDelta
      : -(e.detail || 0)

    if (
      (delta > 0 && scrollTop <= delta) ||
      (delta < 0 && scrollHeight - height - scrollTop <= -1 * delta)
    ) {
      target.scrollTop = delta > 0 ? 0 : scrollHeight
      e.preventDefault()
    }
  })
}

export class CustomError extends Error {
  constructor(code = '500', id = 0, message) {
    super(message)
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = (new Error(message)).stack
    }

    this.code = code
    this.id = id
    this.message = message
    this.date = new Date()
  }
}
