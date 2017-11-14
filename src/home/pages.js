import { asyncRoute } from '@/lib'

import Account from 'bundle-loader?lazy!./settings/account'

export default [
  { text: '首页', pathname: '' },
  {
    text: '设置',
    component: [
      { text: '帐号设置', pathname: '/account', component: asyncRoute(Account) }
    ]
  }
]

// 左侧菜单没有对应入口的页面
export const otherPages = [

]
