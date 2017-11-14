import React, { Component } from 'react'
import { Route, Switch, withRouter } from 'react-router-dom'
import { asyncRoute, Utils } from '@/lib'
import { Layout } from 'antd'
import { Header, NoMatch, Footer } from '@/components'

/* eslint-disable import/no-webpack-loader-syntax */
import Home from 'bundle-loader?lazy!./home'
import Login from './login'
import Help from 'bundle-loader?lazy!./help'
import Apply from 'bundle-loader?lazy!./apply'  // bundle-loader会导致整个路由下的组件重新加载, 要避免header和footer每次都卸载再装载
import Third from 'bundle-loader?lazy!./third'
/* eslint-disable import/no-webpack-loader-syntax */

Utils.autoBlur()

@withRouter
export default class App extends Component {
  render () {
    return (
      <Layout>
        <Header />
        <Switch>
          <Route
            path='/home'
            component={asyncRoute(Home)}
          />
          <Route
            exact
            path='/'
            component={Login}
          />
          <Route
            path='/help'
            component={asyncRoute(Help)}
          />
          <Route
            exact
            path='/apply'
            component={asyncRoute(Apply)}
          />
          <Route
            exact
            path='/login/dologin/'
            component={asyncRoute(Third)}
          />
          <Route component={NoMatch} />
        </Switch>
        <Footer />
      </Layout>
    )
  }
}
