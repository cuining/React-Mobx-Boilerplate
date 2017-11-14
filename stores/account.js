import { action, observable, computed } from 'mobx'
import { API } from '@/lib'

class Account {
  accessToken = window.localStorage.getItem('access_token')

  @observable authenticated = !!this.accessToken
  @observable authenticating = false

  async login () {

  }

  async logout () {

  }

}

export default Account
