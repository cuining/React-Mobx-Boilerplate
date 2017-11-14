/* global File, FileReader, Image */

import React from 'react'
import Animate from 'rc-animate'
import { Icon, Progress } from 'antd'
import { Icon as ZIcon } from '@/components'
import classNames from 'classnames'

const rotation = {
  1: 'rotate(0deg)',
  3: 'rotate(180deg)',
  6: 'rotate(90deg)',
  8: 'rotate(270deg)'
}

// https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
const previewFile = (file, callback) => {
  const reader = new FileReader()
  reader.onloadend = () => {
    const blobUrl = window.URL.createObjectURL(file)
    const scanner = new DataView(reader.result)
    let idx = 0
    let value = 1 // Non-rotated is the default
    if (reader.result.length < 2 || scanner.getUint16(idx) !== 0xFFD8) {
      // Not a JPEG
      if (callback) {
        callback(blobUrl)
      }
      return
    }
    idx += 2
    let maxBytes = scanner.byteLength
    while (idx < maxBytes - 2) {
      const uint16 = scanner.getUint16(idx)
      idx += 2
      switch (uint16) {
        case 0xFFE1: // Start of EXIF
          const exifLength = scanner.getUint16(idx)
          maxBytes = exifLength - idx
          idx += 2
          break
        case 0x0112: // Orientation tag
          // Read the value, its 6 bytes further out
          // See page 102 at the following URL
          // http://www.kodak.com/global/plugins/acrobat/en/service/digCam/exifStandard2.pdf
          value = scanner.getUint16(idx + 6, false)
          maxBytes = 0 // Stop scanning
          break
      }
    }

    const img = new Image()
    img.src = blobUrl
    img.onload = () => {
      const aspect = img.width / img.height
      callback(blobUrl, aspect, value)
    }
  }
  reader.readAsArrayBuffer(file)
}

const getFilesize = (bytes, decimals = 1) => {
  const sz = 'BKMGTP'
  const factor = Math.floor((bytes.toString().length - 1) / 3)
  if (factor === 0 || factor === 1) {
    decimals = 0
  }
  return (bytes / Math.pow(1024, factor)).toFixed(decimals) + sz[factor]
}

export default class UploadList extends React.PureComponent {
  static defaultProps = {
    listType: 'text', // or picture
    progressAttr: {
      strokeWidth: 2,
      showInfo: false
    },
    prefixCls: 'ant-upload',
    showRemoveIcon: true,
    showPreviewIcon: true
  }

  componentDidUpdate () {
    if (this.props.listType !== 'picture' && this.props.listType !== 'picture-card') {
      return
    }
    (this.props.items || []).forEach(file => {
      if (typeof document === 'undefined' ||
          typeof window === 'undefined' ||
          !window.FileReader || !window.File ||
          !(file.originFileObj instanceof File) ||
          file.thumbUrl !== undefined) {
        return
      }
      /*eslint-disable */
      file.thumbUrl = ''
      /*eslint-enable */
      previewFile(file.originFileObj, (previewDataUrl, aspect, value = 1) => {
        /*eslint-disable */
        file.thumbUrl = previewDataUrl
        file.aspect = aspect
        file.transform = rotation[value]
        /*eslint-enable */
        this.forceUpdate()
      })
    })
  }

  render () {
    const {
      prefixCls,
      items = [],
      listType,
      onlyShowFailed,
      ...restProps
    } = this.props

    const listClassNames = classNames({
      [`${prefixCls}-list`]: true,
      [`${prefixCls}-list-${listType}`]: true
    })

    const targetItems = onlyShowFailed ? items.filter(file => file.status === 'error') : items

    return (
      <div className={listClassNames}>
        {
          targetItems.map(file => <Item key={file.uid} {...restProps} prefixCls={prefixCls} listType={listType} file={file} percent={file.percent} status={file.status} thumbUrl={file.thumbUrl} />)
        }
      </div>
    )
  }
}

class Item extends React.Component {
  shouldComponentUpdate (nextProps) {
    if (nextProps.percent !== this.props.percent) {
      return true
    }
    if (nextProps.status !== this.props.status) {
      return true
    }
    if (nextProps.thumbUrl !== this.props.thumbUrl) {
      return true
    }
    return false
  }

  handleClose = file => {
    const onRemove = this.props.onRemove
    if (onRemove) {
      onRemove(file)
    }
  }

  handlePreview = (file, e) => {
    const { onPreview } = this.props
    if (!onPreview) {
      return
    }
    e.preventDefault()
    return onPreview(file)
  }

  render () {
    const {
      prefixCls,
      listType,
      showPreviewIcon,
      showRemoveIcon,
      locale,
      file
    } = this.props

    let progress
    let icon = (
      <Icon type={file.status === 'uploading' ? 'loading' : 'paper-clip'} />
    )

    if (listType === 'picture' || listType === 'picture-card') {
      if ((!file.thumbUrl && !file.url)) {
        if (listType === 'picture-card') {
          icon = (
            <div className={`${prefixCls}-list-item-uploading-text`}>
              上传中...
            </div>
          )
        } else {
          icon = (
            <Icon
              className={`${prefixCls}-list-item-thumbnail`}
              type='picture'
            />
          )
        }
      } else {
        icon = (
          ['image/tiff', 'application/postscript'].indexOf(file.type) > -1
            ? <Icon
              className={`${prefixCls}-list-item-thumbnail`}
              type='picture'
              />
              : <div className={`${prefixCls}-list-item-thumbnail aligner-center-horitzontal aligner-center-vertical`}>
                {file.aspect >= 1
                  ? <img src={file.thumbUrl || file.url} style={{width: '100%', height: 'auto', transform: file.transform}} />
                  : <img src={file.thumbUrl || file.url} style={{width: 'auto', height: '100%', transform: file.transform}} />
                }
              </div>
        )
      }
    }

    if (file.status === 'uploading') {
      // show loading icon if upload progress listener is disabled
      const loadingProgress =
        'percent' in file
          ? <Progress
            type='line'
            {...this.props.progressAttr}
            percent={file.percent}
            />
          : null

      progress = (
        <div className={`${prefixCls}-list-item-progress`} key='progress'>
          {loadingProgress}
        </div>
      )
    }
    const infoUploadingClass = classNames({
      [`${prefixCls}-list-item`]: true,
      [`${prefixCls}-list-item-${file.status}`]: true
    })

    const preview = file.url
      ? <a
        href={file.url}
        target='_blank'
        rel='noopener noreferrer'
        className={`${prefixCls}-list-item-name`}
        style={{width: '90%'}}
        onClick={e => this.handlePreview(file, e)}
        title={file.name}
        >
        {file.name}
      </a>
      : <span
        className={`${prefixCls}-list-item-name`}
        onClick={e => this.handlePreview(file, e)}
        style={{width: '90%'}}
        title={file.name}
        >
        {file.name}
      </span>
    const style =
      file.url || file.thumbUrl
        ? undefined
        : {
          pointerEvents: 'none',
          opacity: 0.5
        }
    const previewIcon = showPreviewIcon
      ? <a
        href={file.url || file.thumbUrl}
        target='_blank'
        rel='noopener noreferrer'
        style={style}
        onClick={e => this.handlePreview(file, e)}
        title={locale.previewFile}
        >
        <Icon type='eye-o' />
      </a>
      : null
    const reloadIcon = <Icon type='reload' title='重新上传' onClick={() => this.props.onReUpload(file)} />
    const removeIcon = showRemoveIcon
      ? <ZIcon
        type='delete'
        className='custom-svg'
        title={locale.removeFile}
        onClick={() => this.handleClose(file)}
        />
      : null

    const actions =
      listType === 'picture-card' && file.status !== 'uploading'
        ? <span className={`${prefixCls}-list-item-actions`}>
          {previewIcon}
          {removeIcon}
        </span>
        : listType === 'picture' ? <span className={`${prefixCls}-list-item-actions`}>
          {file.status === 'error' && file.response.code === 502 && reloadIcon}
          {(file.status === 'error' || file.status === 'uploading') && removeIcon}
        </span> : <span className={`${prefixCls}-list-item-actions`}>
          {removeIcon}
        </span>

    const iconAndPreview = (<span>
      {icon}
      {preview}
    </span>)
    const flexStyle = {
      flex: 1
    }

    const fileInfoBar = listType === 'picture' ? (<div className={`${prefixCls}-list-item-status`}>
      <span style={flexStyle}>{getFilesize(file.size)}</span>
      {(file.status === 'uploading' || file.status === undefined) && <span style={flexStyle}>
        {file.percent ? `已上传${parseInt(file.percent, 10)}%` : '等待中'}
      </span>}
      {file.status === 'error' && <span style={flexStyle}>
        <Icon type='close-circle' style={{ color: '#F4523B', marginRight: 6 }} />上传失败
      </span>}
      {file.status === 'error' && <span className='status-error-detail'>
        {file.response && file.response.message}
      </span>}
      {file.status === 'done' && <span style={flexStyle}>
        <Icon type='check-circle' style={{ color: '#58BC46', marginRight: 6 }} />上传成功
      </span>}
    </div>) : null
    return (
      <div className={infoUploadingClass}>
        <div className={`${prefixCls}-list-item-info`}>
          {iconAndPreview}
        </div>
        {fileInfoBar}
        {actions}
        <Animate transitionName='fade' component=''>
          {progress}
        </Animate>
      </div>
    )
  }
}
