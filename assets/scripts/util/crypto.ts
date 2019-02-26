const HASH_ALGORITHM = 'SHA-256'
const MODE = 'AES-GCM'
const INITIALIZATION_VECTOR_LENGTH = 12

export const supportsCrypto = () => {
  const typedWindow = (window as any)

  return typedWindow.crypto
    && typedWindow.crypto.subtle
    && typedWindow.TextEncoder
}

export const encrypt = async (plainText: string, password: string) => {
  const typedWindow = (window as any)
  const ptUtf8 = new typedWindow.TextEncoder().encode(plainText);
  const pwUtf8 = new typedWindow.TextEncoder().encode(password);
  const pwHash = await typedWindow.crypto.subtle.digest(HASH_ALGORITHM, pwUtf8); 
  const iv = typedWindow.crypto.getRandomValues(new Uint8Array(INITIALIZATION_VECTOR_LENGTH));
  const alg = { name: MODE, iv, length: 256 };
  const key = await typedWindow.crypto.subtle.importKey('raw', pwHash, alg, false, ['encrypt']);

  return { iv, encBuffer: await typedWindow.crypto.subtle.encrypt(alg, key, ptUtf8) };
}

export const decrypt = async (ctBuffer: ArrayBuffer, iv: Uint8Array, password: string) => {
  const typedWindow = (window as any)
  const pwUtf8 = new typedWindow.TextEncoder().encode(password);
  const pwHash = await typedWindow.crypto.subtle.digest(HASH_ALGORITHM, pwUtf8);
  const alg = { name: MODE, iv, length: 256 };
  const key = await typedWindow.crypto.subtle.importKey('raw', pwHash, alg, false, ['decrypt']);
  const ptBuffer = await typedWindow.crypto.subtle.decrypt(alg, key, ctBuffer);
  const plaintext = new typedWindow.TextDecoder().decode(ptBuffer);

  return plaintext;
}
