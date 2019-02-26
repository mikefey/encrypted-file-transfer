import { getElementByClassName } from '../../util/dom'

const CONTENT_CLASS = 'upload-button-section'
const CANCEL_UPLOAD_BUTTON_CLASS = 'cancel-upload-button'

type CancelUploadCallbackType = () => void

interface UploadButtonSectionPrototype {
  cancelUploadButton: HTMLElement
  contentEl: HTMLElement
  init(): void
}

const uploadButtonSectionCreator = (cancelUploadCallback: CancelUploadCallbackType) => {
  const proto: UploadButtonSectionPrototype = {
    cancelUploadButton: null,
    contentEl: null,

    init() {
      this.contentEl = getElementByClassName(CONTENT_CLASS)
      this.cancelUploadButton = getElementByClassName(CANCEL_UPLOAD_BUTTON_CLASS)

      this.cancelUploadButton.addEventListener('click', cancelUploadCallback)
    }
  }

  return Object.create(proto)
}

export default uploadButtonSectionCreator
