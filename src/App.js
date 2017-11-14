import React, { Component } from 'react'
import { Route, Switch, withRouter } from 'react-router-dom'
import { asyncRoute, Utils } from '@/lib'
import { Layout } from 'antd'
import { Header, NoMatch, Footer } from '@/components'

/* eslint-disable import/no-webpack-loader-syntax */
import Home from 'bundle-loader?lazy!./home'
import Login from './login'
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
