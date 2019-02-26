import { supportsCrypto, encrypt } from '../../util/crypto'
import { getElementByClassName } from '../../util/dom'
import { getHost } from '../../util/get-host'
import ChooseFileSection from './choose-file-section'
import PasswordSection from './password-section'
import UploadButtonSection from './upload-button-section'
import { EncryptedFile } from '../../types'
import { CRYPTO_NOT_SUPPORTED_ERROR } from '../../constants'

const CONTENT_CLASS = 'content'
const FORM_CLASS = 'create-file-form'
const ERROR_MESSAGE_CLASS = 'error-message'
const ON_FILE_SELECT_ERROR = 'Sorry, there was an error encoding your file.'
const SUCCESS_MESSAGE_CLASS = 'success-message'
const SHOW_ERROR_MESSAGE_CLASS = 'show-error-message'
const SHOW_PASSWORD_SECTION_CLASS = 'show-password-section'
const SHOW_UPLOAD_BUTTON_CLASS = 'show-upload-button-section'
const HIDE_ALL_SECTIONS_CLASS = 'hide-all-sections'
const SUBMITTING_DATA_CLASS = 'submitting-data'
const SHOW_COMPLETE_SECTION_CLASS = 'show-complete-section'
const LOADER_CLASS = 'loader'

interface UploadAppPrototype {
  cancelUpload(): void
  chooseFileSection: Object
  contentEl: HTMLElement
  crsfToken: string
  encodedFile: string
  errorMessageEl: HTMLElement
  fileUploadNameEl: string
  formAttributes: { method: string, action: string },
  formEl: HTMLElement
  hostUrl: string
  init(): void
  loaderEl: HTMLElement
  onFileSelected(fileData: { encodedFile: string, name: string }): void
  onFileSelectError(): void
  onFormSubmit(e: Event): void
  onPasswordInputChange(password: string): void
  onUploadComplete(response: EncryptedFile): void
  password: string
  passwordSection: Object
  selectedFileName: string
  showCryptoNotSupportedError(): void
  successMessageEl: HTMLElement
  validData(): Boolean
  uploadButtonSection: Object
}

const uploadAppCreator = () => {
  const proto: UploadAppPrototype = {
    chooseFileSection: null,
    contentEl: null,
    crsfToken: null,
    formEl: null,
    hostUrl: null,
    loaderEl: null,
    encodedFile: null,
    errorMessageEl: null,
    formAttributes: {
      method: null,
      action: null,
    },
    fileUploadNameEl: null,
    password: null,
    passwordSection: null,
    selectedFileName: null,
    successMessageEl: null,
    uploadButtonSection: null,

    init() {
      this.hostUrl = getHost()
      this.contentEl = getElementByClassName(CONTENT_CLASS)
      this.formEl = getElementByClassName(FORM_CLASS)
      this.errorMessageEl = getElementByClassName(ERROR_MESSAGE_CLASS)
      this.successMessageEl = getElementByClassName(SUCCESS_MESSAGE_CLASS)
      this.loaderEl = getElementByClassName(LOADER_CLASS)
      this.crsfToken = (document.querySelector('[name="_csrf_token"]') as HTMLInputElement).value

      this.showCryptoNotSupportedError = this.showCryptoNotSupportedError.bind(this)

      if (!supportsCrypto()) {
        this.showCryptoNotSupportedError()
        return
      }

      this.onFileSelected = this.onFileSelected.bind(this)
      this.onFileSelectError = this.onFileSelectError.bind(this)
      this.onPasswordInputChange = this.onPasswordInputChange.bind(this)
      this.cancelUpload = this.cancelUpload.bind(this)
      this.onFormSubmit = this.onFormSubmit.bind(this)
      this.validData = this.validData.bind(this)
      this.onUploadComplete = this.onUploadComplete.bind(this)

      this.chooseFileSection = ChooseFileSection(this.onFileSelected, this.onFileSelectError)
      this.passwordSection = PasswordSection(this.onPasswordInputChange)
      this.uploadButtonSection = UploadButtonSection(this.cancelUpload)

      this.chooseFileSection.init()
      this.passwordSection.init()
      this.uploadButtonSection.init()

      this.formAttributes = {
        method: this.formEl.getAttribute('method'),
        action: this.formEl.getAttribute('action'),
      }

      this.formEl.addEventListener('submit', this.onFormSubmit)
    },

    showCryptoNotSupportedError() {
      this.contentEl.classList.add(SHOW_ERROR_MESSAGE_CLASS)
      this.contentEl.classList.add(HIDE_ALL_SECTIONS_CLASS)
      this.errorMessageEl.innerHTML = CRYPTO_NOT_SUPPORTED_ERROR
    },

    onFileSelected(fileData) {
      const { encodedFile, name } = fileData

      this.selectedFileName = name
      this.encodedFile = encodedFile
      this.contentEl.classList.remove(SHOW_ERROR_MESSAGE_CLASS)

      if (encodedFile) {
        this.contentEl.classList.add(SHOW_PASSWORD_SECTION_CLASS)
      } else {
        this.contentEl.classList.remove(SHOW_PASSWORD_SECTION_CLASS)
        this.contentEl.classList.remove(SHOW_UPLOAD_BUTTON_CLASS)
      }
    },

    onFileSelectError() {
      this.contentEl.classList.add(SHOW_ERROR_MESSAGE_CLASS)
      this.errorMessageEl.innerHTML = ON_FILE_SELECT_ERROR
    },

    onPasswordInputChange(password) {
      this.password = password

      if (password) {
        this.contentEl.classList.add(SHOW_UPLOAD_BUTTON_CLASS)
      } else {
        this.contentEl.classList.remove(SHOW_UPLOAD_BUTTON_CLASS)
      }
    },

    cancelUpload() {
      this.onFileSelected({ encodedFile: null, name: null })
      this.chooseFileSection.removeFile()
    },

    validData() {
      return this.selectedFileName && this.selectedFileName.length
        && this.encodedFile && this.encodedFile.length
        && this.password && this.password.length
    },

    onUploadComplete(responseData) {
      this.contentEl.classList.remove(SHOW_PASSWORD_SECTION_CLASS)
      this.contentEl.classList.remove(SHOW_UPLOAD_BUTTON_CLASS)
      this.contentEl.classList.add(SHOW_COMPLETE_SECTION_CLASS)

      this.successMessageEl.innerHTML = `<p>File successfully uploaded:</p> <a href='${this.hostUrl}/${responseData.id}'>${this.hostUrl}/${responseData.id}</a>`
    },

    async onFormSubmit(e) {
      e.preventDefault()

      if (this.validData()) {
        const encryptedFile = await encrypt(this.encodedFile, this.password)
        const fileBlob = new Blob([encryptedFile.encBuffer]);
        const data = new FormData()

        data.append('extension', this.selectedFileName.split('.').pop())
        data.append('encrypted_file', fileBlob)
        data.append('initialization_vector', encryptedFile.iv.toString())

        this.contentEl.classList.add(SUBMITTING_DATA_CLASS)
        this.loaderEl.classList.add('show')

        const response = await (window as any).fetch(this.formAttributes.action, {
          headers: { 'x-csrf-token': this.crsfToken },  
          method: this.formAttributes.method,
          body: data
        })

        this.contentEl.classList.remove(SUBMITTING_DATA_CLASS)
        this.loaderEl.classList.remove('show')
        this.onUploadComplete(await response.json())
      }
    },
  }

  return Object.create(proto)
}

export default uploadAppCreator
