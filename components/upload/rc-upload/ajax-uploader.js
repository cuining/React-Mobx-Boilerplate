/* eslint react/no-is-mounted:0 react/sort-comp:0 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import defaultRequest from './request'
import getUid from './uid'
import { PQueue } from '@/lib'

class AjaxUploader extends Component {
  static propTypes = {
    component: PropTypes.string,
    style: PropTypes.object,
    prefixCls: PropTypes.string,
    className: PropTypes.string,
    multiple: PropTypes.bool,
    disabled: PropTypes.bool,
    accept: PropTypes.string,
    children: PropTypes.any,
    onStart: PropTypes.func,
    data: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    headers: PropTypes.object,
    beforeUpload: PropTypes.func,
    customRequest: PropTypes.func,
    onProgress: PropTypes.func,
    withCredentials: PropTypes.bool
  }

  state = { uid: getUid() }
  queue = new PQueue({ concurrency: 2 })
  reqs = {}

  onChange = e => {
    const files = e.target.files
    this.uploadFiles(files)
    this.reset()
  }

  onClick = () => {
    const el = this.refs.file
    if (!el) {
      return
    }
    el.click()
  }

  onKeyDown = e => {
    if (e.key === 'Enter') {
      this.onClick()
    }
  }

  onFileDrop = e => {
    if (e.type === 'dragover') {
      e.preventDefault()
      return
    }

    const files = e.dataTransfer.files
    this.uploadFiles(files)

    e.preventDefault()
  }

  componentDidMount () {
    this._isMounted = true
  }

  componentWillUnmount () {
    this._isMounted = false
    this.abort()
  }

  uploadFiles (files) {
    const postFiles = Array.prototype.slice.call(files)

    postFiles.forEach(file => {
      file.uid = getUid()
    })

    this.props.onStart(postFiles)

    postFiles.forEach(file => {
      this.queue.add(() => this.upload(file, postFiles))
    })
  }

  async upload (file, fileList) {
    const { props } = this

    const before = props.beforeUpload(file, fileList)
    if (before && before.then) {
      await before
        .then(processedFile => {
          const processedFileType = Object.prototype.toString.call(
            processedFile
          )
          if (
            processedFileType === '[object File]' ||
            processedFileType === '[object Blob]'
          ) {
            this.post(processedFile)
          } else {
            this.post(file)
          }
        })
        .catch(e => {
          console && console.log(e) // eslint-disable-line
        })
    } else if (before !== false) {
      try {
        const res = await this.post(file)
        if (props.afterUpload) {
          if (res.result) {
            props.afterUpload(res.data, this.reqs[file.uid]).then(res => {
              props.onSuccess(res, file)
            }).catch(e => {
              props.onError(e, e, file)
            })
          } else {
            const error = new Error(res.message)
            props.onError(error, error, file)
          }
        } else {
          props.onSuccess(res, file)
        }
      } catch (e) {
        props.onError(e, e, file)
      } finally {
        delete this.reqs[file.uid]
        Promise.resolve()
      }
    }
  }

  post (file) {
    if (!this._isMounted) {
      return
    }

    const { props } = this

    const isLt50M = file.size / 1024 / 1024 > 50
    if (isLt50M) {
      const msg = '图片最大50M'
      const error = new Error(msg)
      props.onError(error, { message: msg, code: 500 }, file)
      return Promise.reject(error)
    }
    let { data } = props
    const { onProgress } = props

    if (typeof data === 'function') {
      data = data(file)
    }
    const { uid } = file
    const request = props.customRequest || defaultRequest

    this.reqs[uid] = {}
    return request({
      action: props.action,
      filename: props.name,
      file,
      data,
      headers: props.headers,
      withCredentials: props.withCredentials,
      onProgress: onProgress ? e => { onProgress(e, file) } : null
    }, this.reqs[uid])
  }

  reset () {
    this.setState({
      uid: getUid()
    })
  }

  abort (file) {
    const { reqs } = this
    if (file) {
      let uid = file
      if (file && file.uid) {
        uid = file.uid
      }
      if (reqs[uid]) {
        reqs[uid].abort()
        reqs[uid].cancel && reqs[uid].cancel()
        delete reqs[uid]
      }
    } else {
      Object.keys(reqs).forEach(uid => {
        if (reqs[uid]) {
          reqs[uid].abort()
          reqs[uid].cancel && reqs[uid].cancel()
        }

        delete reqs[uid]
      })
    }
  }

  render () {
    const {
      component: Tag,
      prefixCls,
      className,
      disabled,
      style,
      multiple,
      accept,
      children
    } = this.props
    const cls = classNames({
      [prefixCls]: true,
      [`${prefixCls}-disabled`]: disabled,
      [className]: className
    })
    const events = disabled
      ? {}
      : {
        onClick: this.onClick,
        onKeyDown: this.onKeyDown,
        onDrop: this.onFileDrop,
        onDragOver: this.onFileDrop,
        tabIndex: '0'
      }
    return (
      <Tag {...events} className={cls} role='button' style={style}>
        <input
          type='file'
          ref='file'
          key={this.state.uid}
          style={{ display: 'none' }}
          accept={accept}
          multiple={multiple}
          onChange={this.onChange}
        />
        {children}
      </Tag>
    )
  }
}

export default AjaxUploader
