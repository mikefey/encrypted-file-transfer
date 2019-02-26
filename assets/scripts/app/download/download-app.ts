import { supportsCrypto, decrypt } from '../../util/crypto'
import { getElementByClassName } from '../../util/dom'
import PasswordSection from './password-section'
import { EncryptedFile } from '../../types'
import { CRYPTO_NOT_SUPPORTED_ERROR } from '../../constants'

const CONTENT_CLASS = 'content'
const DECRYPT_ERROR = 'Sorry, there was an error decrypting the file.'
const DOWNLOAD_ERROR = 'Sorry, there was an error downloading the file.'
const FORM_CLASS = 'download-file-form'
const ERROR_MESSAGE_CLASS = 'error-message'
const SHOW_ERROR_MESSAGE_CLASS = 'show-error-message'
const HIDE_ALL_SECTIONS_CLASS = 'hide-all-sections'
const SUBMITTING_DATA_CLASS = 'submitting-data'
const SHOW_DOWNLOAD_LINK_CLASS = 'show-download-link'
const SUCCESS_MESSAGE_CLASS = 'success-message'
const LOADER_CLASS = 'loader'

interface DownloadAppCreatorPrototype {
  contentEl: HTMLElement
  decryptFile(fileBuffer: ArrayBuffer, file: EncryptedFile): void
  destroyFile(decryptedFile: string, file: EncryptedFile): void
  encodedFile: string
  fileUploadNameEl: HTMLElement
  hideLoader(): void
  init(): void
  onFormSubmit(e: Event): void
  onPasswordInputChange(input: string): void
  openFile(file: EncryptedFile): void
  password: string
  selectedFileName: string
  showCryptoNotSupportedError(): void
  showDecryptError(): void
  showDownloadError(): void
  showDownloadLink(decryptedFile: string, file: EncryptedFile): void
}

const downloadAppCreator = () => {
  const proto: DownloadAppCreatorPrototype = {
    contentEl: null,
    encodedFile: null,
    fileUploadNameEl: null,
    password: null,
    selectedFileName: null,

    init() {
      this.contentEl = getElementByClassName(CONTENT_CLASS)
      this.formEl = getElementByClassName(FORM_CLASS)
      this.successMessageEl = getElementByClassName(SUCCESS_MESSAGE_CLASS)
      this.errorMessageEl = getElementByClassName(ERROR_MESSAGE_CLASS)
      this.loaderEl = getElementByClassName(LOADER_CLASS)
      this.crsfToken = (document.querySelector('[name="_csrf_token"]') as HTMLInputElement).value

      this.showCryptoNotSupportedError = this.showCryptoNotSupportedError.bind(this)
      this.onPasswordInputChange = this.onPasswordInputChange.bind(this)
      this.showDownloadError = this.showDownloadError.bind(this)
      this.showDecryptError = this.showDecryptError.bind(this)
      this.openFile = this.openFile.bind(this)
      this.decryptFile = this.decryptFile.bind(this)
      this.destroyFile = this.destroyFile.bind(this)
      this.showDownloadLink = this.showDownloadLink.bind(this)
      this.hideLoader = this.hideLoader.bind(this)

      if (!supportsCrypto()) {
        this.showCryptoNotSupportedError()
        return
      }

      this.onFormSubmit = this.onFormSubmit.bind(this)

      this.formAttributes = {
        method: this.formEl.getAttribute('method'),
        action: this.formEl.getAttribute('action'),
      }

      this.passwordSection = PasswordSection(this.onPasswordInputChange)
      this.passwordSection.init()

      this.formEl.addEventListener('submit', this.onFormSubmit)
    },

    onPasswordInputChange(password) {
      this.password = password
    },

    showCryptoNotSupportedError() {
      this.contentEl.classList.add(SHOW_ERROR_MESSAGE_CLASS)
      this.contentEl.classList.add(HIDE_ALL_SECTIONS_CLASS)
      this.errorMessageEl.innerHTML = CRYPTO_NOT_SUPPORTED_ERROR
    },

    showDownloadError() {
      this.contentEl.classList.add(SHOW_ERROR_MESSAGE_CLASS)
      this.contentEl.classList.add(HIDE_ALL_SECTIONS_CLASS)
      this.errorMessageEl.innerHTML = DOWNLOAD_ERROR
    },

    showDecryptError() {
      this.contentEl.classList.add(SHOW_ERROR_MESSAGE_CLASS)
      this.errorMessageEl.innerHTML = DECRYPT_ERROR
    },

    hideLoader() {
      this.contentEl.classList.remove(SUBMITTING_DATA_CLASS)
      this.loaderEl.classList.remove('show')
    },

    async openFile(file) {
      try {
        const typedWindow = (window as any)
        const fileContents = await typedWindow.fetch(`downloads/${file.id}`, {
          headers: { 'x-csrf-token': this.crsfToken },  
          method: 'GET',
        })
        const fileBuffer = await fileContents.arrayBuffer()

        this.decryptFile(fileBuffer, file)
      } catch (e) {
        this.showDecryptError()
        this.hideLoader()
      }
    },

    async decryptFile(fileBuffer, file) {
      const iv = new Uint8Array(file.initialization_vector.split(',').map(Number))

      try {
        const decrypted = await decrypt(fileBuffer, iv, this.password)
        this.destroyFile(decrypted, file)
      } catch (e) {
        this.showDecryptError()
        this.hideLoader()
      }
    },

    async destroyFile(decrypted, file) {
      const typedWindow = (window as any)

      try {
        const response = await typedWindow.fetch(`/${file.id}`, {
          headers: { 'x-csrf-token': this.crsfToken },  
          method: 'DELETE',
        })

        if (!response.ok) {
          this.showDecryptError()
        } else {
          this.showDownloadLink(decrypted, file)
        }
        
      } catch (e) {
        this.showDecryptError()
      }

      this.hideLoader()
    },

    showDownloadLink(base64String, file) {
      this.contentEl.classList.add(HIDE_ALL_SECTIONS_CLASS)
      this.contentEl.classList.add(SHOW_DOWNLOAD_LINK_CLASS)
      this.successMessageEl.innerHTML = `<a href='${base64String}' download='${file.id}.${file.extension}'>Download File</a>`
    },

    async onFormSubmit(e) {
      e.preventDefault()

      this.contentEl.classList.remove(SHOW_ERROR_MESSAGE_CLASS)
      this.contentEl.classList.add(SUBMITTING_DATA_CLASS)
      this.loaderEl.classList.add('show')

      const typedWindow = (window as any)
      const response = await typedWindow.fetch(this.formAttributes.action, {
        headers: { 'x-csrf-token': this.crsfToken },  
        method: this.formAttributes.method,
      })

      if (!response.ok) {
        this.showDownloadError()

        this.hideLoader()
      } else {
        this.openFile(await response.json())
      }
    },
  }

  return Object.create(proto)
}

export default downloadAppCreator
