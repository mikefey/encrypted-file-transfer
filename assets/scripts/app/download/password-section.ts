import { getElementByClassName } from '../../util/dom'

const CONTENT_CLASS = 'password'
const PASSWORD_INPUT_CLASS = 'password-input'

type ChangeCallbackType = (password: string) => void

interface PasswordSectionPrototype {
  contentEl: HTMLElement
  init(): void
  onInputChange(e: Event): void
  passwordInput: HTMLElement
  reset(): void
}

const passwordSectionCreator = (callback: ChangeCallbackType) => {
  const proto: PasswordSectionPrototype = {
    contentEl: null,
    passwordInput: null,

    onInputChange(e) {
      const inputVal = (e.target as any).value

      callback(inputVal)
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
