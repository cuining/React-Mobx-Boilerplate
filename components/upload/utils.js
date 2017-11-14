export function T () {
  return true
}

// Fix IE file.status problem
// via coping a new Object
export function fileToObject (file) {
  return {
    lastModified: file.lastModified,
    lastModifiedDate: file.lastModifiedDate,
    name: file.filename || file.name,
    size: file.size,
    type: file.type,
    uid: file.uid,
    response: file.response,
    error: file.error,
    percent: 0,
    originFileObj: file,
    status: null
  }
}

/**
 * 生成Progress percent: 0.1 -> 0.98
 *   - for ie
 */
export function genPercentAdd () {
  let k = 1
  const end = 99
  return function (s) {
    let start = s
    if (start >= end) {
      return start
    }

    start += k

    return start
  }
}

export function getFileItem (file, fileList) {
  const matchKey = file.uid !== undefined ? 'uid' : 'name'
  return fileList.filter(item => item[matchKey] === file[matchKey])[0]
}

export function removeFileItem (file, fileList) {
  const matchKey = file.uid !== undefined ? 'uid' : 'name'
  const removed = fileList.filter(item => item[matchKey] !== file[matchKey])
  if (removed.length === fileList.length) {
    return null
  }
  return removed
}
