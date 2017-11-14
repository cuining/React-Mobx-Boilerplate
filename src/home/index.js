import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Route, Link, Switch } from 'react-router-dom'
import { Icon } from '@/components'
import { withAuth, Utils } from '@/lib'
import { Layout, Menu } from 'antd'
import pages, { otherPages } from './pages'
import { HomeIndex } from './others'

const { Sider, Content } = Layout

const type = [ 'home', 'manage', 'insight', 'income', 'find', 'setting' ]

@withAuth
@observer
export default class Home extends Component {
  renderTitle (index, text) {
    return [<Icon type={type[index]} key={`${index}-1`} className='pos-a pos-left' />, <span key={`${index}-2`}>{text}</span>]
  }

  render () {
    const { match, location } = this.props
    let selectedKey = Utils.toRoute(location.pathname)

    // get all pathNames
    const pathNames = [].concat(
      ...pages
      .filter((p, index) => index !== 0)
      .map(p => p.component.map(c => c.pathname))
    )

    // match the selectedKey with `match.url + path`
    pathNames.forEach(path => {
      if (selectedKey.includes(match.url + path)) {
        selectedKey = match.url + path
      }
    })

    return (
      <Layout>
        <Sider
          width={220}
          style={{height: 685}}
          trigger={null}
        >
          <Menu mode='inline' defaultSelectedKeys={[selectedKey]}>
            {
              pages.map((page, index) => {
                if (Array.isArray(page.component)) {
                  return (
                    <Menu.ItemGroup key={`g${index}`} title={this.renderTitle(index, page.text)}>
                      {
                        page.component.map(c =>
                          <Menu.Item key={match.url + c.pathname}><Link to={match.url + c.pathname}>{c.text}</Link></Menu.Item>
                        )
                      }
                    </Menu.ItemGroup>
                  )
                }
                return (
                  <Menu.Item key={match.url + page.pathname}>
                    <Link className='aligner-center-vertical aligner-center-horitzontal' to={match.url + page.pathname}>{this.renderTitle(index, page.text)}</Link>
                  </Menu.Item>
                )
              })
            }
          </Menu>
        </Sider>
        <Layout>
          <Content>
            <Switch>
              <Route path={`${match.url}`} exact component={HomeIndex} />
              {
                otherPages.map(c => <Route key={match.url + c.pathname} path={match.url + c.pathname} component={c.component} />)
              }
              {
                pages.filter(page => Array.isArray(page.component)).map(page => page.component.map(c =>
                  <Route key={match.url + c.pathname} path={match.url + c.pathname} component={c.component} />
                ))
              }
            </Switch>
          </Content>
        </Layout>
      </Layout>
    )
  }
}
