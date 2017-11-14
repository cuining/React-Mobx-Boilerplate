import React, { Component } from 'react'
import { Redirect, Link } from 'react-router-dom'
import { inject, observer } from 'mobx-react'
import config from 'config'

@inject('store')
@observer
export default class Login extends Component {
  account = this.props.store.account

  componentDidMount () {

  }

  render () {
    return (
      <section className='login-index'>
      </section>
    )
  }
}
