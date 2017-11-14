import React from 'react'


import QQ from '../../public/qq.svg'
import Weibo from '../../public/weibo.svg'

const Icon = {}

Icon.qq = QQ
Icon.weibo = Weibo

export default ({ type, ...props }) => {
  if (type in Icon) {
    const C = Icon[type]
    return <C {...props} />
  }
  return null
}
