export const getElementByClassName = (className: string): Element | undefined => {
  const elements = document.getElementsByClassName(className)
  const elementArray: Element[] | null = elements.length ? Array.from(elements) : null

  if (elementArray && elementArray.length) {
    return elementArray[0]
  }
}