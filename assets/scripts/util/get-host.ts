export const getHost = (): string => {
  const pathArray = location.href.split('/');
  const protocol = pathArray[0];
  const host = pathArray[2];

  return `${protocol}//${host}`
}