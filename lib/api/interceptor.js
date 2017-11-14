import download from 'downloadjs'

const interceptor = instance => {
  instance.interceptors.request.use(
    config => {
      const token = window.localStorage.getItem('access_token')

      if (token !== null && config.url.indexOf('login') === -1) {
        config.headers['access-token'] = token
      }

      // if download
      if (config.url.indexOf('export') !== -1) {
        config.responseType = 'blob'
        config['Content-Type'] = 'application/vnd.ms-excel'
      }

      return config
    },
    error => Promise.reject(error)
  )

  instance.interceptors.response.use(
    response => {
      if (response.data.error_code === 401) {
        window.localStorage.removeItem('access_token')
        window.location.href = '/'
      }

      if (response.data.error_code === 300) {
        window.location.href = '/apply'
      }

      if (response.data instanceof window.Blob) {
        const filename = response.headers['content-disposition']
          .replace(/attachment; filename="/, '')
          .replace(/"/, '')
        download(response.data, decodeURIComponent(filename))
      }
      return response.data
    },
    error => Promise.reject(error)
  )

  return instance
}

export default interceptor
