import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { inject, observer } from 'mobx-react'

import './style.scss'

@inject('store')
@observer
export default class Footer extends Component {
  account = this.props.store.account

  render () {

    return (
      <footer className='z-footer'>
        <nav>

        </nav>
        <p>{`Copyrignt © 2004-${new Date().getFullYear()}`}</p>
      </footer>
    )
  }
}
