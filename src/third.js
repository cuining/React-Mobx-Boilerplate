import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import qs from 'qs'

@inject('store')
@observer
export default class Third extends Component {
  account = this.props.store.account

  componentDidMount () {
    const { TOKEN } = qs.parse(window.location.search.replace('?', ''))

    this.account.loginWithToken(TOKEN)
    .then(() => {
      setTimeout(window.close, 500)
      if (window.opener) {
        window.opener.location.reload()
      }
    }).catch(console.log)
  }

  render () {
    return null
  }
}
