import './lib/classlist-polyfill'
import { getElementByClassName } from './util/dom'
import UploadApp from './app/upload/upload-app'
import DownloadApp from './app/download/download-app'
import '../css/index.scss'

const CREATE_FORM_CLASS = 'create-file-form'
const DOWNLOAD_FORM_CLASS = 'download-file-form'

document.addEventListener('DOMContentLoaded', () => {
  let app
  
  if (getElementByClassName(CREATE_FORM_CLASS)) {
    app = UploadApp()
  }

  if (getElementByClassName(DOWNLOAD_FORM_CLASS)) {
    app = DownloadApp()
  }

  app.init()
})
