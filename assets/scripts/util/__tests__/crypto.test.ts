import 'jsdom-global/register';
import * as chai from 'chai';
import * as WebCrypto from 'node-webcrypto-ossl';
import * as encoding from 'text-encoding';
import { encrypt, decrypt } from '../crypto';

(window as any).TextEncoder = encoding.TextEncoder;
(window as any).TextDecoder = encoding.TextDecoder;
(window as any).crypto = new WebCrypto()

const expect = chai.expect;

describe('encrypt', () => {
  it('returns an object with encrypted text and initialization vector' , async () => {
    const encrypted = await encrypt('lorem ipsum', 'password')

    expect(typeof encrypted).to.equal('object');
    expect(encrypted.iv.constructor).to.equal(Uint8Array);
    expect(encrypted.encBuffer.constructor).to.equal(ArrayBuffer);
    expect(encrypted.iv.length).to.equal(12);
  });
});

describe('decrypt', () => {
  it('returns a string' , async () => {
    const encrypted = await encrypt('lorem ipsum', 'password')
    const decrypted = await decrypt(encrypted.encBuffer, encrypted.iv, 'password')

    expect(decrypted).to.equal('lorem ipsum');
  });
});
