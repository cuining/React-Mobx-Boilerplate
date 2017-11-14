import '../styles/index.scss'
import 'antd/lib/upload/style'

import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { useStrict } from 'mobx'
import { Provider } from 'mobx-react'
import { AppContainer } from 'react-hot-loader'

import 'lazysizes'
import 'core-js/shim'
import App from './App'
import stores from '../stores'

useStrict(true)

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <Provider store={stores}>
        <Router>
          <Component />
        </Router>
      </Provider>
    </AppContainer>,
    document.getElementById('root')
  )
}

render(App)

if (module.hot) {
  module.hot.accept('./App', () => render(App))
}
