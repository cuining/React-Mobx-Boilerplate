import React, { Component } from 'react'
import classNames from 'classnames'
import UploadList from './upload-list'
import RcUpload from './rc-upload'

import {
  T,
  fileToObject,
  genPercentAdd,
  getFileItem,
  removeFileItem
} from './utils'

import './style.scss'

const defaultLocale = {
  uploading: '文件上传中',
  removeFile: '删除文件',
  uploadError: '上传错误',
  previewFile: '预览文件'
}

// rewrite antd upload
export default class Upload extends Component {
  static defaultProps = {
    prefixCls: 'ant-upload',
    type: 'select',
    multiple: false,
    action: '',
    data: {},
    accept: '',
    beforeUpload: T,
    showUploadList: true,
    listType: 'text',
    className: '',
    disabled: false,
    supportServerRender: true,
    onlyShowFailed: false,
    abortWhenUnmount: true
  }

  progressTimer = null

  state = {
    fileList: this.props.fileList || this.props.defaultFileList || [],
    dragState: 'drop'
  }

  componentWillUnmount () {
    this.clearProgressTimer()
  }

  getLocale () {
    let locale = {}
    if (this.context.antLocale && this.context.antLocale.Upload) {
      locale = this.context.antLocale.Upload
    }
    return {
      ...defaultLocale,
      ...locale,
      ...this.props.locale
    }
  }

  onStart = file => {
    let targetItem
    let nextFileList = this.state.fileList.concat()
    if (file.length > 0) {
      targetItem = file.map(f => {
        const fileObject = fileToObject(f)
        fileObject.status = 'uploading'
        return fileObject
      })
      nextFileList = nextFileList.concat(targetItem)
    } else {
      targetItem = fileToObject(file)
      const index = nextFileList.findIndex(file => file.uid === targetItem.uid)
      if (index !== -1) {
        nextFileList[index] = targetItem
      } else {
        nextFileList.push(targetItem)
      }
      targetItem.status = 'uploading'
    }
    this.onChange({
      file: targetItem,
      fileList: nextFileList
    })

    this.props.onStarted && this.props.onStarted()

    if (!window.FormData) {
      this.autoUpdateProgress(0, targetItem)
    }
  }

  autoUpdateProgress = (_, file, auto = false) => {
    const getPercent = genPercentAdd()
    let curPercent = _
    this.clearProgressTimer()
    this.progressTimer = setInterval(() => {
      curPercent = getPercent(curPercent)
      this.onProgress(
        {
          percent: curPercent
        },
        file,
        auto
      )
    }, 200)
  }

  onSuccess = (response, file) => {
    this.clearProgressTimer()
    try {
      if (typeof response === 'string') {
        response = JSON.parse(response)
      }
    } catch (e) {
      /* do nothing */
    }
    let fileList = this.state.fileList
    let targetItem = getFileItem(file, fileList)
    // removed
    if (!targetItem) {
      return
    }
    targetItem.response = response
    targetItem.status = 'done'
    this.onChange({
      file: { ...targetItem },
      fileList
    })
  }

  onProgress = (e, file, auto = false) => {
    let fileList = this.state.fileList
    let targetItem = getFileItem(file, fileList)
    // removed
    if (!targetItem) {
      return
    }

    if (this.props.afterUpload && !auto) {
      targetItem.percent = e.percent * 0.99
    } else {
      targetItem.percent = e.percent
    }

    this.onChange({
      event: e,
      file: { ...targetItem },
      fileList: this.state.fileList
    })
  }

  onError = (error, response, file) => {
    this.clearProgressTimer()
    let fileList = this.state.fileList
    let targetItem = getFileItem(file, fileList)
    // removed
    if (!targetItem) {
      return
    }
    targetItem.error = error
    if (!response) {
      targetItem.response = { message: '网络问题', code: 502 }
    } else {
      targetItem.response = response
    }
    targetItem.status = 'error'
    this.onChange({
      file: { ...targetItem },
      fileList
    })
  }

  handleRemove = (file) => {
    const { onRemove } = this.props

    Promise.resolve(
      typeof onRemove === 'function' ? onRemove(file) : onRemove
    ).then(ret => {
      // Prevent removing file
      if (ret === false) {
        return
      }

      const removedFileList = removeFileItem(file, this.state.fileList)
      if (removedFileList) {
        this.onChange({
          file,
          fileList: removedFileList
        })
      }
    })
  }

  handleManualRemove = file => {
    this.abort(file)
    this.handleRemove(file)
  }

  onChange = info => {
    if (!('fileList' in this.props)) {
      this.setState({ fileList: info.fileList })
    }

    const { onChange } = this.props
    if (onChange) {
      onChange(info)
    }
  }

  componentWillReceiveProps (nextProps) {
    if ('fileList' in nextProps) {
      this.setState({
        fileList: nextProps.fileList || []
      })
    }
  }

  onFileDrop = e => {
    this.setState({
      dragState: e.type
    })
  }

  clearProgressTimer = () => {
    clearInterval(this.progressTimer)
  }

  selectFile = () => {
    this.refs.upload.click()
  }

  abort = (file) => {
    this.refs.upload.abort(file)
  }

  reuploadAll = () => {
    this.state.fileList.filter(file => file.status === 'error' && file.response.code === 502).forEach(file => {
      this.handleReupload(file)
    })
  }

  handleReupload = (file) => {
    this.refs.upload.upload(file.originFileObj, file)
  }

  render () {
    const {
      prefixCls = '',
      showUploadList,
      listType,
      onPreview,
      type,
      disabled,
      children,
      className,
      onlyShowFailed
    } = this.props

    const rcUploadProps = {
      onStart: this.onStart,
      onError: this.onError,
      onProgress: this.onProgress,
      onSuccess: this.onSuccess,
      autoUpdateProgress: this.autoUpdateProgress,
      clearProgressTimer: this.clearProgressTimer,
      ...this.props
    }

    delete rcUploadProps.className

    const { showRemoveIcon, showPreviewIcon } = showUploadList
    const uploadList = showUploadList
      ? <UploadList
        listType={listType}
        items={this.state.fileList}
        onPreview={onPreview}
        onRemove={this.handleManualRemove}
        showRemoveIcon={showRemoveIcon}
        onReUpload={this.handleReupload}
        showPreviewIcon={showPreviewIcon}
        locale={this.getLocale()}
        onlyShowFailed={onlyShowFailed}
        />
      : null

    if (type === 'drag') {
      const dragCls = classNames(prefixCls, {
        [`${prefixCls}-drag`]: true,
        [`${prefixCls}-drag-uploading`]: this.state.fileList.some(
          file => file.status === 'uploading'
        ),
        [`${prefixCls}-drag-hover`]: this.state.dragState === 'dragover',
        [`${prefixCls}-disabled`]: disabled
      })
      return (
        <span className={className}>
          <div
            className={dragCls}
            onDrop={this.onFileDrop}
            onDragOver={this.onFileDrop}
            onDragLeave={this.onFileDrop}
          >
            <RcUpload
              {...rcUploadProps}
              ref='upload'
              className={`${prefixCls}-btn`}
            >
              <div className={`${prefixCls}-drag-container`}>
                {children}
              </div>
            </RcUpload>
          </div>
          {uploadList}
        </span>
      )
    }

    const uploadButtonCls = classNames(prefixCls, {
      [`${prefixCls}-select`]: true,
      [`${prefixCls}-select-${listType}`]: true,
      [`${prefixCls}-disabled`]: disabled
    })

    const uploadButton = (
      <div
        className={uploadButtonCls}
        style={{ display: children ? '' : 'none' }}
      >
        <RcUpload {...rcUploadProps} ref='upload' />
      </div>
    )
    if (listType === 'picture-card') {
      return (
        <span className={className}>
          {uploadList}
          {uploadButton}
        </span>
      )
    }
    return (
      <span className={className}>
        {uploadButton}
        {uploadList}
      </span>
    )
  }
}
