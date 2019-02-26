import { getElementByClassName } from '../../util/dom'

const CONTENT_CLASS = 'password-section'
const PASSWORD_INPUT_CLASS = 'password-input'
const HIDE_HINT_CLASS = 'hide-hint'

type CallbackType = (inputVal: string | null) => void

interface PasswordSectionPrototype {
  contentEl: HTMLElement
  onInputChange(e: Event): void
  init(): void
  passwordInput: HTMLInputElement
  reset(): void
}

const passwordSectionCreator = (callback: CallbackType) => {
  const proto: PasswordSectionPrototype = {
    contentEl: null,
    passwordInput: null,

    onInputChange(e) {
      const inputVal = (e.target as any).value

      if (inputVal.length > 7) {
        this.contentEl.classList.add(HIDE_HINT_CLASS)
        callback(inputVal)
      } else {
        this.contentEl.classList.remove(HIDE_HINT_CLASS)
        callback(null)
      }
    },

    init() {
      this.reset = this.reset.bind(this)
      this.onInputChange = this.onInputChange.bind(this)

      this.contentEl = getElementByClassName(CONTENT_CLASS)
      this.passwordInput = getElementByClassName(PASSWORD_INPUT_CLASS)

      this.passwordInput.addEventListener('keyup', this.onInputChange)
    },

    reset() {
      this.passwordInput.value = ''
    }
  }

  return Object.create(proto)
}

export default passwordSectionCreator
