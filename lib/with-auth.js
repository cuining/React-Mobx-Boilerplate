import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'

const withAuth = Page => {
  @inject('store')
  @observer
  class AuthenticatedComponent extends Component {
    account = this.props.store.account

    render () {
      const { authenticated, authenticating } = this.account

      return authenticated
        ? <Page {...this.props} />
        : !authenticating
          ? <Redirect
            to={{
              pathname: '/',
              state: { from: this.props.location }
            }}
            />
          : null
    }
  }
  return AuthenticatedComponent
}

export default withAuth
