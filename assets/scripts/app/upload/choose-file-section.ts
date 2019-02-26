import { getElementByClassName } from '../../util/dom'
import { getBase64 } from '../../util/file'

const CONTENT_CLASS = 'choose-file-content'
const FILE_UPLOAD_INPUT_CLASS = 'choose-file-input'
const FILE_UPLOAD_NAME_CLASS = 'choose-file-name'
const REMOVE_FILE_BUTTON_CLASS = 'choose-file-remove-button'
const FILE_SELECTED_CLASS = 'file-selected'

type ChangeCallbackType = (params: { encodedFile: string, name: string }) => void

interface ChooseFileSectionPrototype {
  contentEl: HTMLElement
  fileUploadNameEl: HTMLElement
  init(): void
  onFileSelected(e: Event): Promise<void>
  removeFile(): void
  selectedFileName: string | null
}

const chooseFileSectionCreator = (changeCallback: ChangeCallbackType, errorCallback) => {
  const proto: ChooseFileSectionPrototype = {
    contentEl: null,
    fileUploadNameEl: null,
    selectedFileName: null,
    
    removeFile() {
      this.selectedFileName = null
      this.fileUploadNameEl.innerHTML = null
      this.contentEl.classList.remove(FILE_SELECTED_CLASS)

      changeCallback({ encodedFile: null, name: null })
    },
    
    async onFileSelected(e: Event) {
      try {
        const file = (e.target as any).files[0]
        const name = file.name
        const encodedFile: string = await getBase64(file)

        this.selectedFileName = name
        this.fileUploadNameEl.innerHTML = `<strong>File:</strong> ${name}`
        this.contentEl.classList.add(FILE_SELECTED_CLASS)

        changeCallback({ encodedFile, name: file.name })
      } catch(e) {
        errorCallback(e)
      }
    },
    
    init() {
      const fileUploadInput = getElementByClassName(FILE_UPLOAD_INPUT_CLASS)
      const removeFileButton = getElementByClassName(REMOVE_FILE_BUTTON_CLASS)

      this.contentEl = getElementByClassName(CONTENT_CLASS)
      this.fileUploadNameEl = getElementByClassName(FILE_UPLOAD_NAME_CLASS)

      fileUploadInput.addEventListener('change', this.onFileSelected.bind(this))
      removeFileButton.addEventListener('click', this.removeFile.bind(this))
    }
  }

  return Object.create(proto)
}

export default chooseFileSectionCreator
